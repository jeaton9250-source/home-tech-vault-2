import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

import { parseOrderItems } from "@/lib/import/parseOrderItems";

const resend = new Resend(
  process.env.RESEND_API_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ResendReceivedEvent = {
  type: string;

  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string | null;
    message_id?: string | null;
  };
};

export async function POST(
  request: NextRequest
) {
  try {
    /*
      Resend webhook verification must use
      the original raw request body.
    */
    const rawBody =
      await request.text();

    const svixId =
      request.headers.get("svix-id");

    const svixTimestamp =
      request.headers.get(
        "svix-timestamp"
      );

    const svixSignature =
      request.headers.get(
        "svix-signature"
      );

    if (
      !svixId ||
      !svixTimestamp ||
      !svixSignature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing webhook headers.",
        },
        {
          status: 400,
        }
      );
    }

    let event: ResendReceivedEvent;

    try {
      event =
        resend.webhooks.verify({
          payload: rawBody,

          headers: {
            id: svixId,
            timestamp:
              svixTimestamp,
            signature:
              svixSignature,
          },

          webhookSecret:
            process.env
              .RESEND_WEBHOOK_SECRET!,
        }) as ResendReceivedEvent;
    } catch (error) {
      console.error(
        "Invalid Resend webhook:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      We only care about incoming email.
    */
    if (
      event.type !==
      "email.received"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    /*
      Find which forwarding address
      received this email.
    */
    const recipient =
      event.data.to?.[0];

    if (!recipient) {
      return NextResponse.json(
        {
          error:
            "No recipient found.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Example:

      jason-test-01@fuevwun.resend.app

      becomes:

      jason-test-01
    */
    const token =
      recipient
        .split("@")[0]
        ?.trim()
        .toLowerCase();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Unable to determine import token.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Find the Home Tech Vault user
      associated with this forwarding address.
    */
    const {
      data: importAddress,
      error: importAddressError,
    } = await supabaseAdmin
      .from("import_addresses")
      .select(
        "user_id, household_id, token"
      )
      .eq("token", token)
      .single();

    if (
      importAddressError ||
      !importAddress
    ) {
      console.error(
        "Unknown Smart Import address:",
        token,
        importAddressError
      );

      /*
        Return 200 so Resend does not
        continually retry an address
        that Home Tech Vault doesn't know.
      */
      return NextResponse.json({
        received: true,
        ignored: true,
        reason:
          "Unknown import address.",
      });
    }

    /*
      The webhook only gives us email
      metadata.

      Fetch the actual received email
      from Resend.
    */
    const {
      data: receivedEmail,
      error: emailError,
    } =
      await resend.emails.receiving.get(
        event.data.email_id
      );

    if (
      emailError ||
      !receivedEmail
    ) {
      console.error(
        "Unable to fetch received email:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "Unable to retrieve email contents.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      Prefer plain text.

      If the email only contains HTML,
      convert it into readable text.
    */
    const rawText =
      receivedEmail.text ||
      stripHtml(
        receivedEmail.html || ""
      );

    type SmartImportAttachment = {
      emailId: string;
      attachmentId: string;
      filename: string;
      contentType: string | null;
      size: number | null;
    };

    let receiptAttachments:
      SmartImportAttachment[] = [];

    try {
      const attachmentResponse =
        await fetch(
          `https://api.resend.com/emails/receiving/${event.data.email_id}/attachments`,
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

      if (!attachmentResponse.ok) {
        console.warn(
          "[smart-import] Unable to list inbound attachments:",
          attachmentResponse.status
        );
      } else {
        const attachmentPayload =
          await attachmentResponse.json() as {
            data?: Array<{
              id?: string;
              filename?: string;
              content_type?: string;
              size?: number;
            }>;
          };

        const allowedTypes =
          new Set([
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ]);

        const allowedExtensions =
          /\.(pdf|jpe?g|png|webp)$/i;

        receiptAttachments =
          (
            attachmentPayload.data ??
            []
          )
            .filter(
              (attachment) => {
                const contentType =
                  attachment
                    .content_type
                    ?.toLowerCase() ??
                  "";

                const filename =
                  attachment
                    .filename ??
                  "";

                const supported =
                  allowedTypes.has(
                    contentType
                  ) ||
                  allowedExtensions.test(
                    filename
                  );

                const reasonableSize =
                  typeof attachment.size !==
                    "number" ||
                  attachment.size <=
                    15 * 1024 * 1024;

                return (
                  Boolean(
                    attachment.id
                  ) &&
                  supported &&
                  reasonableSize
                );
              }
            )
            .slice(0, 5)
            .map(
              (attachment) => ({
                emailId:
                  event.data.email_id,

                attachmentId:
                  attachment.id!,

                filename:
                  attachment.filename ||
                  "receipt",

                contentType:
                  attachment
                    .content_type ??
                  null,

                size:
                  typeof attachment.size ===
                    "number"
                    ? attachment.size
                    : null,
              })
            );

        if (
          receiptAttachments.length >
          0
        ) {
          console.info(
            "[smart-import] Receipt attachments detected",
            {
              emailId:
                event.data.email_id,

              count:
                receiptAttachments.length,

              files:
                receiptAttachments.map(
                  (attachment) =>
                    attachment.filename
                ),
            }
          );
        }
      }
    } catch (error) {
      console.warn(
        "[smart-import] Attachment discovery failed:",
        error
      );
    }

    if (!rawText.trim()) {
      console.error(
        "Received email contained no readable content:",
        event.data.email_id
      );

      return NextResponse.json(
        {
          error:
            "Received email had no readable content.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      NEW FREE SMART IMPORT PARSER

      This now sends the email through:

      Amazon parser
      Best Buy parser
      Home Depot parser
      Lowe's parser

      or the generic fallback.
    */
    const parsedItems =
      await parseOrderItems(
        rawText
      );

    const parsed =
      parsedItems[0] ?? null;

    console.log(
      "Smart Import parsed order:",
      {
        deviceCount:
          parsedItems.length,
        retailer:
          parsed?.retailer ??
          null,
      }
    );

    if (
      parsedItems.length === 0
    ) {
      console.log(
        "Smart Import skipped email because no device was detected:",
        event.data.email_id
      );

      return NextResponse.json({
        received: true,
        ignored: true,
        reason:
          "No device could be identified.",
      });
    }

    /*
      Create the pending Smart Import.

      The user will review this at /imports
      before anything enters their real vault.
    */
    const importRows =
      parsedItems.map(
        (item, index) => ({
          user_id:
            importAddress.user_id,

          household_id:
            importAddress.household_id,

          source: "email",

          source_message_id:
            `${event.data.email_id}:${index + 1}`,

          sender_email:
            event.data.from,

          subject:
            event.data.subject,

          retailer:
            item.retailer,

          order_number:
            item.orderNumber,

          device_name:
            item.deviceName,

          category:
            item.category,

          brand:
            item.brand,

          manufacturer:
            item.manufacturer,

          model_number:
            item.modelNumber,

          serial_number:
            item.serialNumber,

          purchase_date:
            item.purchaseDate,

          purchase_price:
            item.purchasePrice,

          confidence:
            item.confidence,

          extraction_notes:
            item.retailer
              ? `Parsed using Home Tech Vault Smart Import multi-device extraction for ${item.retailer}.`
              : "Parsed using Home Tech Vault Smart Import multi-device extraction.",

          raw_text:
            rawText,

          raw_data: {
            parsedItem:
              item,

            totalDeviceItems:
              parsedItems.length,

            inboundEmailId:
              event.data.email_id,

            receiptAttachments,
          },

          status: "pending",

          updated_at:
            new Date().toISOString(),
        })
      );

    const {
      data: createdImports,
      error: insertError,
    } = await supabaseAdmin
      .from("device_imports")
      .insert(importRows)
      .select("*");

    const createdImport =
      createdImports?.[0] ??
      null;

    if (insertError) {
      /*
        Your unique source_message_id
        protection prevents the same
        inbound email being imported twice.
      */
      if (
        insertError.code ===
        "23505"
      ) {
        console.log(
          "Duplicate inbound email ignored:",
          event.data.email_id
        );

        return NextResponse.json({
          received: true,
          duplicate: true,
        });
      }

      console.error(
        "Unable to create Smart Import:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create Smart Import.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Smart Import created:",
      {
        id: createdImport.id,
        device:
          createdImport.device_name,
        retailer:
          createdImport.retailer,
      }
    );

    return NextResponse.json({
      received: true,

      importCreated: true,

      importId:
        createdImport?.id ??
        null,

      importIds:
        createdImports?.map(
          (item) => item.id
        ) ?? [],

      deviceCount:
        createdImports?.length ??
        0,

      deviceName:
        createdImport?.device_name ??
        null,

      retailer:
        createdImport?.retailer ??
        null,

      confidence:
        createdImport?.confidence ??
        null,
    });
  } catch (error) {
    console.error(
      "Inbound Resend webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected inbound email error.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  Basic HTML → text conversion.

  Most forwarded receipts include a
  plain-text version, but this gives us
  a fallback for HTML-only emails.
*/
function stripHtml(
  value: string
) {
  return value
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )

    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )

    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )

    .replace(
      /<\/p>/gi,
      "\n"
    )

    .replace(
      /<\/div>/gi,
      "\n"
    )

    .replace(
      /<\/tr>/gi,
      "\n"
    )

    .replace(
      /<\/li>/gi,
      "\n"
    )

    .replace(
      /<[^>]+>/g,
      " "
    )

    .replace(
      /&nbsp;/gi,
      " "
    )

    .replace(
      /&amp;/gi,
      "&"
    )

    .replace(
      /&quot;/gi,
      '"'
    )

    .replace(
      /&#39;/gi,
      "'"
    )

    .replace(
      /&lt;/gi,
      "<"
    )

    .replace(
      /&gt;/gi,
      ">"
    )

    .replace(
      /[ \t]{2,}/g,
      " "
    )

    .replace(
      /[ \t]+\n/g,
      "\n"
    )

    .replace(
      /\n[ \t]+/g,
      "\n"
    )

    .replace(
      /\n{3,}/g,
      "\n\n"
    )

    .trim();
}