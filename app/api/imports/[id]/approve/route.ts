import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { retryDeviceManualLookup } from "@/app/devices/actions";

type ApproveBody = {
  device_name?: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number | null;
  warranty_expiration?: string;
  location?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createSupabaseServerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            // Safe to ignore when cookies cannot be mutated.
          }
        },
      },
    }
  );
}

function cleanText(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned || null;
}

type SmartImportReceiptAttachment = {
  emailId: string;
  attachmentId: string;
  filename: string;
  contentType: string | null;
  size: number | null;
};

function getSmartImportReceiptAttachments(
  rawData: unknown
): SmartImportReceiptAttachment[] {
  if (
    !rawData ||
    typeof rawData !==
      "object" ||
    Array.isArray(rawData)
  ) {
    return [];
  }

  const record =
    rawData as
      Record<
        string,
        unknown
      >;

  if (
    !Array.isArray(
      record.receiptAttachments
    )
  ) {
    return [];
  }

  const results:
    SmartImportReceiptAttachment[] =
      [];

  for (
    const value of
    record.receiptAttachments
  ) {
    if (
      !value ||
      typeof value !==
        "object" ||
      Array.isArray(value)
    ) {
      continue;
    }

    const attachment =
      value as
        Record<
          string,
          unknown
        >;

    const emailId =
      typeof attachment.emailId ===
        "string"
        ? attachment.emailId.trim()
        : "";

    const attachmentId =
      typeof attachment.attachmentId ===
        "string"
        ? attachment.attachmentId.trim()
        : "";

    const filename =
      typeof attachment.filename ===
        "string"
        ? attachment.filename.trim()
        : "";

    const contentType =
      typeof attachment.contentType ===
        "string"
        ? attachment.contentType.trim()
        : null;

    const size =
      typeof attachment.size ===
        "number" &&
      Number.isFinite(
        attachment.size
      )
        ? attachment.size
        : null;

    if (
      !emailId ||
      !attachmentId ||
      !filename
    ) {
      continue;
    }

    results.push({
      emailId,
      attachmentId,
      filename,
      contentType,
      size,
    });
  }

  return results;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();

    const supabase =
      createSupabaseServerClient(
        cookieStore
      );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    let body: ApproveBody = {};

    try {
      body = await request.json();
    } catch {
      // Empty body is okay.
      // We can fall back to imported values.
    }

    const {
      data: importRecord,
      error: importError,
    } = await supabase
      .from("device_imports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (
      importError ||
      !importRecord
    ) {
      return NextResponse.json(
        {
          error:
            "Smart Import not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      Prevent duplicate device creation
      if this import has already been approved.
    */
    if (
      importRecord.status ===
        "approved" &&
      importRecord.created_device_id
    ) {
      return NextResponse.json({
        success: true,
        deviceId:
          importRecord.created_device_id,
        alreadyApproved: true,
      });
    }

    if (
      importRecord.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "This import can no longer be approved.",
        },
        {
          status: 409,
        }
      );
    }

    const deviceName =
      cleanText(body.device_name) ??
      cleanText(
        importRecord.device_name
      );

    if (!deviceName) {
      return NextResponse.json(
        {
          error:
            "A device name is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Resolve the household ID.

      1. Use the household already stored
         on the import if available.

      2. Otherwise, look at one of the user's
         existing devices and reuse that
         household ID.
    */
    let householdId =
      importRecord.household_id ?? null;

    if (!householdId) {
      const {
        data: existingDevice,
        error: householdLookupError,
      } = await supabase
        .from("devices")
        .select("household_id")
        .eq("user_id", user.id)
        .not(
          "household_id",
          "is",
          null
        )
        .limit(1)
        .maybeSingle();

      if (householdLookupError) {
        console.error(
          "Unable to resolve household ID:",
          householdLookupError
        );
      }

      householdId =
        existingDevice?.household_id ??
        null;
    }

    /*
      If we still don't have a household ID,
      stop here rather than create a device
      that will not appear in the user's vault.
    */
    if (!householdId) {
      return NextResponse.json(
        {
          error:
            "Unable to determine which household this device belongs to.",
          details:
            "No household ID was found on the import or on an existing device.",
        },
        {
          status: 400,
        }
      );
    }

    const purchasePrice =
      typeof body.purchase_price ===
      "number"
        ? body.purchase_price
        : importRecord.purchase_price;

    const smartImportBrand =
      cleanText(
        body.brand
      ) ??
      cleanText(
        body.manufacturer
      ) ??
      cleanText(
        importRecord.brand
      ) ??
      cleanText(
        importRecord.manufacturer
      );

    const smartImportModel =
      cleanText(
        body.model_number
      ) ??
      cleanText(
        importRecord.model_number
      );

    const canAttemptManualLookup =
      Boolean(
        smartImportBrand &&
        smartImportModel
      );

    const devicePayload = {
      user_id: user.id,

      household_id: householdId,

      device_name: deviceName,

      category:
        cleanText(body.category) ??
        cleanText(
          importRecord.category
        ) ??
        "Other",

      brand:
        smartImportBrand,

      manufacturer:
        cleanText(
          body.manufacturer
        ) ??
        cleanText(
          importRecord.manufacturer
        ) ??
        smartImportBrand,

      model_number:
        smartImportModel,

      manual_status:
        canAttemptManualLookup
          ? "pending"
          : null,

      manual_checked_at:
        null,

      serial_number:
        cleanText(
          body.serial_number
        ) ??
        cleanText(
          importRecord.serial_number
        ),

      purchase_date:
        cleanText(
          body.purchase_date
        ) ??
        cleanText(
          importRecord.purchase_date
        ),

      purchase_price:
        purchasePrice ?? null,

      warranty_expiration:
        cleanText(
          body.warranty_expiration
        ) ??
        cleanText(
          importRecord.warranty_expiration
        ),

      location:
        cleanText(
          body.location
        ) ??
        cleanText(
          importRecord.location
        ),

      notes: [
        "Added with Home Tech Vault Smart Import.",

        importRecord.retailer
          ? `Retailer: ${importRecord.retailer}`
          : null,

        importRecord.order_number
          ? `Order: ${importRecord.order_number}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    };

    const {
      data: device,
      error: deviceError,
    } = await supabase
      .from("devices")
      .insert(devicePayload)
      .select("id")
      .single();

    if (
      deviceError ||
      !device
    ) {
      console.error(
        "Unable to create device:",
        deviceError
      );

      return NextResponse.json(
        {
          error:
            "Unable to add this device to your vault.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? deviceError?.message
              : undefined,
        },
        {
          status: 500,
        }
      );
    }

    /*
      Run the same official manual lookup
      used by the normal Add Device flow.

      Manual lookup is non-fatal. A device
      should still import if no verified
      official manual can be found.
    */
    let manualLookupStatus:
      | "found"
      | "not_found"
      | "skipped"
      | "not_attempted" =
        "not_attempted";

    let manualLookupWarning:
      string | null = null;

    if (
      canAttemptManualLookup &&
      smartImportModel
    ) {
      try {
        console.info(
          "[smart-import] Starting automatic manual lookup",
          {
            deviceId:
              device.id,

            deviceName,

            brand:
              smartImportBrand,

            modelNumber:
              smartImportModel,
          }
        );

        const manualResult =
          await retryDeviceManualLookup({
            deviceId:
              device.id,

            modelNumber:
              smartImportModel,
          });

        if (
          manualResult.success
        ) {
          manualLookupStatus =
            manualResult.status;

          console.info(
            "[smart-import] Automatic manual lookup completed",
            {
              deviceId:
                device.id,

              status:
                manualResult.status,

              modelNumber:
                manualResult.modelNumber,
            }
          );
        } else {
          manualLookupWarning =
            manualResult.error;

          console.warn(
            "[smart-import] Manual lookup returned an error:",
            manualResult.error
          );
        }
      } catch (
        manualError
      ) {
        manualLookupWarning =
          "The device was added, but automatic manual lookup could not be completed.";

        console.warn(
          "[smart-import] Automatic manual lookup failed:",
          manualError
        );
      }
    } else {
      console.info(
        "[smart-import] Manual lookup skipped because brand or model number is missing",
        {
          deviceId:
            device.id,

          brand:
            smartImportBrand,

          modelNumber:
            smartImportModel,
        }
      );
    }

    /*
      Automatically attach the original
      receipt to the new device.

      Original PDF/image attachments are
      preferred. If none can be retrieved,
      Smart Import saves the forwarded email
      contents as a text receipt instead.
    */
    let receiptAttached =
      false;

    let receiptWarning:
      string | null = null;

    const receiptAttachments =
      getSmartImportReceiptAttachments(
        importRecord.raw_data
      );

    const safeDeviceName =
      deviceName
        .replace(
          /[^a-zA-Z0-9._-]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .slice(
          0,
          80
        ) ||
      "device";

    for (
      const attachment of
      receiptAttachments
    ) {
      if (
        receiptAttached
      ) {
        break;
      }

      try {
        const metadataResponse =
          await fetch(
            `https://api.resend.com/emails/receiving/${attachment.emailId}/attachments/${attachment.attachmentId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${process.env.RESEND_API_KEY!}`,
              },
              signal:
                AbortSignal.timeout(
                  10_000
                ),
            }
          );

        if (
          !metadataResponse.ok
        ) {
          console.warn(
            "[smart-import] Unable to retrieve receipt attachment metadata:",
            metadataResponse.status
          );

          continue;
        }

        const metadata =
          await metadataResponse.json() as {
            id?: string;
            filename?: string;
            content_type?: string;
            size?: number;
            download_url?: string;
          };

        if (
          !metadata.download_url
        ) {
          continue;
        }

        if (
          typeof metadata.size ===
            "number" &&
          metadata.size >
            15 * 1024 * 1024
        ) {
          continue;
        }

        const downloadResponse =
          await fetch(
            metadata.download_url,
            {
              signal:
                AbortSignal.timeout(
                  15_000
                ),
            }
          );

        if (
          !downloadResponse.ok
        ) {
          console.warn(
            "[smart-import] Receipt download failed:",
            downloadResponse.status
          );

          continue;
        }

        const receiptBuffer =
          Buffer.from(
            await downloadResponse
              .arrayBuffer()
          );

        if (
          receiptBuffer.length === 0 ||
          receiptBuffer.length >
            15 * 1024 * 1024
        ) {
          continue;
        }

        const originalName =
          (
            metadata.filename ||
            attachment.filename ||
            "receipt"
          )
            .replace(
              /[^a-zA-Z0-9._-]+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            )
            .slice(
              0,
              120
            ) ||
          "receipt";

        const contentType =
          metadata.content_type ||
          attachment.contentType ||
          "application/octet-stream";

        const allowedTypes =
          new Set([
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ]);

        const allowedExtension =
          /\.(pdf|jpe?g|png|webp)$/i
            .test(
              originalName
            );

        if (
          !allowedTypes.has(
            contentType
              .toLowerCase()
          ) &&
          !allowedExtension
        ) {
          continue;
        }

        const storagePath =
          `${householdId}/${device.id}/` +
          `${crypto.randomUUID()}-` +
          originalName;

        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              "documents"
            )
            .upload(
              storagePath,
              receiptBuffer,
              {
                upsert: false,
                contentType,
              }
            );

        if (
          storageError
        ) {
          console.warn(
            "[smart-import] Receipt storage failed:",
            storageError
          );

          continue;
        }

        const {
          error:
            documentError,
        } =
          await supabase
            .from(
              "documents"
            )
            .insert({
              user_id:
                user.id,

              household_id:
                householdId,

              device_id:
                device.id,

              file_name:
                originalName,

              document_name:
                importRecord.retailer
                  ? `${importRecord.retailer} Receipt`
                  : `${deviceName} Receipt`,

              file_url:
                storagePath,

              file_type:
                "Receipt",
            });

        if (
          documentError
        ) {
          console.warn(
            "[smart-import] Receipt document record failed:",
            documentError
          );

          await supabase.storage
            .from(
              "documents"
            )
            .remove([
              storagePath,
            ]);

          continue;
        }

        receiptAttached =
          true;

        console.info(
          "[smart-import] Original receipt attached",
          {
            importId:
              id,

            deviceId:
              device.id,

            filename:
              originalName,
          }
        );
      } catch (error) {
        console.warn(
          "[smart-import] Original receipt attachment failed:",
          error
        );
      }
    }

    if (
      !receiptAttached
    ) {
      const receiptText =
        typeof importRecord.raw_text ===
          "string"
          ? importRecord.raw_text.trim()
          : "";

      if (receiptText) {
        const receiptFileName =
          `${safeDeviceName}-receipt.txt`;

        const storagePath =
          `${householdId}/${device.id}/` +
          `${crypto.randomUUID()}-` +
          receiptFileName;

        const receiptContents = [
          "Home Tech Vault Smart Import Receipt",
          "",

          importRecord.retailer
            ? `Retailer: ${importRecord.retailer}`
            : null,

          importRecord.order_number
            ? `Order: ${importRecord.order_number}`
            : null,

          importRecord.purchase_date
            ? `Purchase date: ${importRecord.purchase_date}`
            : null,

          importRecord.sender_email
            ? `Forwarded from: ${importRecord.sender_email}`
            : null,

          importRecord.subject
            ? `Email subject: ${importRecord.subject}`
            : null,

          "",
          "Original receipt / order confirmation:",
          "",
          receiptText,
        ]
          .filter(
            (
              value
            ): value is string =>
              value !== null
          )
          .join(
            "\n"
          );

        try {
          const receiptBlob =
            new Blob(
              [
                receiptContents,
              ],
              {
                type:
                  "text/plain;charset=utf-8",
              }
            );

          const {
            error:
              textStorageError,
          } =
            await supabase.storage
              .from(
                "documents"
              )
              .upload(
                storagePath,
                receiptBlob,
                {
                  upsert: false,
                  contentType:
                    "text/plain;charset=utf-8",
                }
              );

          if (
            textStorageError
          ) {
            receiptWarning =
              "The device was added, but its receipt could not be saved.";
          } else {
            const {
              error:
                textDocumentError,
            } =
              await supabase
                .from(
                  "documents"
                )
                .insert({
                  user_id:
                    user.id,

                  household_id:
                    householdId,

                  device_id:
                    device.id,

                  file_name:
                    receiptFileName,

                  document_name:
                    importRecord.retailer
                      ? `${importRecord.retailer} Receipt`
                      : `${deviceName} Receipt`,

                  file_url:
                    storagePath,

                  file_type:
                    "Receipt",
                });

            if (
              textDocumentError
            ) {
              await supabase.storage
                .from(
                  "documents"
                )
                .remove([
                  storagePath,
                ]);

              receiptWarning =
                "The device was added, but its receipt could not be linked.";
            } else {
              receiptAttached =
                true;

              console.info(
                "[smart-import] Text receipt fallback attached",
                {
                  importId:
                    id,

                  deviceId:
                    device.id,
                }
              );
            }
          }
        } catch (error) {
          console.warn(
            "[smart-import] Text receipt fallback failed:",
            error
          );

          receiptWarning =
            "The device was added, but its receipt could not be saved.";
        }
      }
    }

    /*
      Mark the import approved and connect
      it to the device that was just created.
    */
    const {
      error: updateError,
    } = await supabase
      .from("device_imports")
      .update({
        status: "approved",

        household_id:
          householdId,

        created_device_id:
          device.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Device created but import status update failed:",
        updateError
      );

      return NextResponse.json(
        {
          success: true,
          deviceId:
            device.id,

          warning:
            "The device was created, but the Smart Import status could not be updated.",
        },
        {
          status: 201,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        deviceId:
          device.id,
        householdId,

        receiptAttached,

        receiptWarning,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Smart Import approval error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while adding this device.",
      },
      {
        status: 500,
      }
    );
  }
}