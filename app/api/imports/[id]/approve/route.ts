import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
        cleanText(body.brand) ??
        cleanText(
          importRecord.brand
        ),

      manufacturer:
        cleanText(
          body.manufacturer
        ) ??
        cleanText(
          importRecord.manufacturer
        ),

      model_number:
        cleanText(
          body.model_number
        ) ??
        cleanText(
          importRecord.model_number
        ),

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