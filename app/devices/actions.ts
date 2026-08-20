"use server";

import {
  resolveOfficialManualPdf,
} from "@/lib/manuals/officialManualResolver";


import {
  normalizeDeviceIdentityForLookup,
} from "@/lib/ai/normalizeDeviceIdentity";


import {
  validateDeviceInput,
} from "@/lib/devices/deviceInputValidation";

import { createClient } from "@/lib/supabase/server";
import {
  applyHouseholdMutationScope,
  applyHouseholdScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import {
  assertCanAddDevice,
  assertCanAddDocument,
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

export type AddDeviceInput = {
  deviceName: string;
  category: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyDate: string;
  purchasePrice: string;
  location: string;
  notes: string;

  /*
   * Optional product identifier from Smart Device Search.
   * Used only to retrieve a generic product image.
   */
  productUpc?: string;
};

export type AddDeviceResult =
  | {
      success: true;
      deviceId: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "UNAUTHENTICATED"
        | "VIEWER_READ_ONLY"
        | "HOUSEHOLD_DEVICE_LIMIT"
        | "FREE_DEVICE_LIMIT"
        | "DEVICE_LIMIT_REACHED"
        | "VALIDATION_ERROR"
        | "UNKNOWN";
    };


const PRODUCT_IMAGE_MAX_BYTES =
  6 * 1024 * 1024;

const UPCITEMDB_LOOKUP_URL =
  "https://api.upcitemdb.com/prod/trial/lookup";

type ProductImageDownload = {
  bytes: Uint8Array;
  contentType: string;
  extension: string;
};

type UpcItemDbLookupResponse = {
  items?: Array<{
    images?: string[];
  }>;
};

type ServerSupabaseClient =
  Awaited<
    ReturnType<
      typeof createClient
    >
  >;

function normalizeProductBarcode(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  const barcode =
    value.replace(/\D/g, "");

  if (
    ![
      8,
      12,
      13,
      14,
    ].includes(barcode.length)
  ) {
    return null;
  }

  return barcode;
}

function getProductImageExtension(
  contentType: string
) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/avif":
      return "avif";

    default:
      return null;
  }
}

function isSafeProductImageUrl(
  value: string
) {
  try {
    const url =
      new URL(value);

    if (
      url.protocol !==
      "https:"
    ) {
      return false;
    }

    const hostname =
      url.hostname
        .trim()
        .toLowerCase();

    /*
     * Product images must be remote HTTPS resources.
     * Never allow obvious local/internal destinations.
     */
    if (
      hostname ===
        "localhost" ||
      hostname.endsWith(
        ".localhost"
      ) ||
      hostname.endsWith(
        ".local"
      ) ||
      hostname ===
        "127.0.0.1" ||
      hostname === "::1"
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function downloadMatchedProductImage(
  productUpc: string
): Promise<ProductImageDownload | null> {
  const barcode =
    normalizeProductBarcode(
      productUpc
    );

  if (!barcode) {
    return null;
  }

  /*
   * Re-resolve the UPC server-side.
   *
   * We intentionally do not trust an arbitrary
   * image URL submitted from the browser.
   */
  const lookupUrl =
    new URL(
      UPCITEMDB_LOOKUP_URL
    );

  lookupUrl.searchParams.set(
    "upc",
    barcode
  );

  const lookupResponse =
    await fetch(
      lookupUrl,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache:
          "no-store",

        signal:
          AbortSignal.timeout(
            5_000
          ),
      }
    );

  if (
    !lookupResponse.ok
  ) {
    console.warn(
      "Product image UPC lookup failed:",
      lookupResponse.status
    );

    return null;
  }

  const lookupData =
    (await lookupResponse.json()) as
      UpcItemDbLookupResponse;

  const imageUrl =
    lookupData.items?.[0]?.images?.find(
      (candidate) =>
        typeof candidate ===
          "string" &&
        isSafeProductImageUrl(
          candidate
        )
    );

  if (!imageUrl) {
    return null;
  }

  /*
   * Do not follow redirects automatically.
   * This keeps the server from unexpectedly
   * fetching a different destination.
   */
  const imageResponse =
    await fetch(
      imageUrl,
      {
        method: "GET",

        headers: {
          Accept:
            "image/avif,image/webp,image/png,image/jpeg,image/gif,image/*",

          "User-Agent":
            "HomeTechVault/1.0",
        },

        redirect:
          "error",

        cache:
          "no-store",

        signal:
          AbortSignal.timeout(
            7_000
          ),
      }
    );

  if (
    !imageResponse.ok
  ) {
    console.warn(
      "Product image download failed:",
      imageResponse.status
    );

    return null;
  }

  const rawContentType =
    imageResponse.headers.get(
      "content-type"
    ) ?? "";

  const contentType =
    rawContentType
      .split(";")[0]
      .trim()
      .toLowerCase();

  const extension =
    getProductImageExtension(
      contentType
    );

  if (!extension) {
    console.warn(
      "Unsupported product image type:",
      contentType
    );

    return null;
  }

  const declaredLength =
    Number(
      imageResponse.headers.get(
        "content-length"
      ) ?? "0"
    );

  if (
    Number.isFinite(
      declaredLength
    ) &&
    declaredLength >
      PRODUCT_IMAGE_MAX_BYTES
  ) {
    console.warn(
      "Product image is too large."
    );

    return null;
  }

  const arrayBuffer =
    await imageResponse.arrayBuffer();

  if (
    arrayBuffer.byteLength >
    PRODUCT_IMAGE_MAX_BYTES
  ) {
    console.warn(
      "Downloaded product image is too large."
    );

    return null;
  }

  return {
    bytes:
      new Uint8Array(
        arrayBuffer
      ),

    contentType,

    extension,
  };
}

async function saveMatchedProductImage({
  supabase,
  userId,
  householdId,
  deviceId,
  productUpc,
}: {
  supabase: ServerSupabaseClient;
  userId: string;
  householdId: string | null;
  deviceId: string;
  productUpc: string;
}) {
  const image =
    await downloadMatchedProductImage(
      productUpc
    );

  if (!image) {
    return false;
  }

  const filePath =
    userId +
    "/" +
    deviceId +
    "/" +
    crypto.randomUUID() +
    "." +
    image.extension;

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        "device-images"
      )
      .upload(
        filePath,
        image.bytes,
        {
          cacheControl:
            "3600",

          contentType:
            image.contentType,

          upsert:
            false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const {
    error: imageRecordError,
  } =
    await supabase
      .from(
        "device_images"
      )
      .insert({
        device_id:
          deviceId,

        user_id:
          userId,

        household_id:
          householdId,

        image_url:
          filePath,
      });

  /*
   * If the DB row fails, remove the uploaded
   * object so we don't leave orphaned files.
   */
  if (imageRecordError) {
    await supabase.storage
      .from(
        "device-images"
      )
      .remove([
        filePath,
      ]);

    throw imageRecordError;
  }

  return true;
}


const AUTO_MANUAL_MAX_BYTES =
  48 * 1024 * 1024;

type IcecatManualAsset = {
  ID?: string;
  URL?: string;
  Type?: string;
  ContentType?: string;
  Description?: string;
  Size?: string | number;
  Language?: string;
  IsPrivate?: string | number;
};

type IcecatManualResponse = {
  msg?: string;

  data?: {
    Multimedia?: IcecatManualAsset[];
  };
};

function normalizeManualBarcode(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  const barcode =
    value.replace(/\D/g, "");

  return [
    8,
    12,
    13,
    14,
  ].includes(barcode.length)
    ? barcode
    : null;
}

function isIcecatAssetUrl(
  value: string
) {
  try {
    const url =
      new URL(value);

    const hostname =
      url.hostname
        .trim()
        .toLowerCase();

    return (
      url.protocol === "https:" &&
      (
        hostname === "icecat.biz" ||
        hostname.endsWith(
          ".icecat.biz"
        )
      )
    );
  } catch {
    return false;
  }
}

function rankManualAsset(
  asset: IcecatManualAsset
) {
  const type =
    asset.Type
      ?.trim()
      .toLowerCase() ?? "";

  const description =
    asset.Description
      ?.trim()
      .toLowerCase() ?? "";

  const language =
    asset.Language
      ?.trim()
      .toUpperCase() ?? "";

  let score = 0;

  if (
    type === "manual pdf"
  ) {
    score += 100;
  } else if (
    type.includes(
      "manual"
    )
  ) {
    score += 80;
  }

  if (
    description.includes(
      "user manual"
    )
  ) {
    score += 60;
  } else if (
    description.includes(
      "manual"
    )
  ) {
    score += 40;
  }

  /*
   * Prefer English when possible.
   * Empty language is commonly
   * international content.
   */
  if (
    language === "EN"
  ) {
    score += 20;
  } else if (
    language === ""
  ) {
    score += 10;
  }

  return score;
}

function chooseIcecatManual(
  assets: IcecatManualAsset[]
) {
  return assets
    .filter((asset) => {
      const type =
        asset.Type
          ?.trim()
          .toLowerCase() ?? "";

      const description =
        asset.Description
          ?.trim()
          .toLowerCase() ?? "";

      const contentType =
        asset.ContentType
          ?.trim()
          .toLowerCase() ?? "";

      const looksLikeManual =
        type.includes(
          "manual"
        ) ||
        description.includes(
          "manual"
        );

      const isPdf =
        contentType ===
          "application/pdf" ||
        asset.URL
          ?.toLowerCase()
          .includes(".pdf");

      const isPublic =
        String(
          asset.IsPrivate ?? "0"
        ) !== "1";

      return (
        looksLikeManual &&
        isPdf &&
        isPublic &&
        Boolean(
          asset.URL
        )
      );
    })
    .sort(
      (left, right) =>
        rankManualAsset(
          right
        ) -
        rankManualAsset(
          left
        )
    )[0] ?? null;
}

function createManualDocumentName(
  brand: string,
  modelNumber: string,
  deviceName: string
) {
  const identity =
    [
      brand.trim(),
      modelNumber.trim(),
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    deviceName.trim() ||
    "Device";

  return (
    identity +
    " User Manual.pdf"
  );
}

async function findIcecatManual({
  productUpc,
  brand,
  modelNumber,
  deviceName,
}: {
  productUpc?: string;
  brand: string;
  modelNumber: string;
  deviceName: string;
}) {
  const username =
    process.env
      .ICECAT_USERNAME
      ?.trim();

  const apiToken =
    process.env
      .ICECAT_ACCESS_TOKEN
      ?.trim();

  const contentToken =
    process.env
      .ICECAT_CONTENT_TOKEN
      ?.trim();

  if (
    !username ||
    !apiToken ||
    !contentToken
  ) {
    console.warn(
      "[manual-enrichment] Icecat credentials are incomplete"
    );

    return null;
  }

  /*
   * Capture validated credentials as definite
   * strings before entering the nested function.
   */
  const icecatUsername = username;
  const icecatApiToken = apiToken;
  const icecatContentToken =
    contentToken;

  async function requestManual(
    identity:
      | {
          gtin: string;
        }
      | {
          brand: string;
          productCode: string;
        }
  ) {
    const url =
      new URL(
        "https://live.icecat.biz/api"
      );

    url.searchParams.set(
      "lang",
      "EN"
    );

    url.searchParams.set(
      "shopname",
      icecatUsername
    );

    url.searchParams.set(
      "content",
      "manuals"
    );

    if ("gtin" in identity) {
      url.searchParams.set(
        "GTIN",
        identity.gtin
      );
    } else {
      url.searchParams.set(
        "Brand",
        identity.brand
      );

      url.searchParams.set(
        "ProductCode",
        identity.productCode
      );
    }

    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            "api-token":
              icecatApiToken,

            "content-token":
              icecatContentToken,
          },

          cache: "no-store",

          signal:
            AbortSignal.timeout(
              7_000
            ),
        }
      );

    if (!response.ok) {
      console.warn(
        "[manual-enrichment] Icecat HTTP:",
        response.status
      );

      return null;
    }

    const payload =
      (await response.json()) as
        IcecatManualResponse;

    if (payload.msg !== "OK") {
      console.info(
        "[manual-enrichment] Icecat returned no matching product"
      );

      return null;
    }

    const assets =
      Array.isArray(
        payload.data?.Multimedia
      )
        ? payload.data?.Multimedia ?? []
        : [];

    const manual =
      chooseIcecatManual(
        assets
      );

    if (
      !manual?.URL ||
      !isIcecatAssetUrl(
        manual.URL
      )
    ) {
      console.info(
        "[manual-enrichment] product found but no usable manual asset"
      );

      return null;
    }

    return {
      manual,
      contentToken:
        icecatContentToken,
    };
  }


  /*
   * 1. Exact barcode match.
   */
  const barcode =
    normalizeManualBarcode(
      productUpc
    );

  if (barcode) {
    console.info(
      "[manual-enrichment] trying GTIN"
    );

    const result =
      await requestManual({
        gtin: barcode,
      });

    if (result) {
      console.info(
        "[manual-enrichment] ✓ matched by GTIN"
      );

      return result;
    }
  }


  /*
   * 2. Exact manufacturer identity.
   */
  const cleanBrand =
    brand.trim();

  const cleanModel =
    modelNumber.trim();

  if (
    cleanBrand &&
    cleanModel
  ) {
    console.info(
      "[manual-enrichment] trying brand + model",
      {
        brand: cleanBrand,
        modelNumber:
          cleanModel,
      }
    );

    const result =
      await requestManual({
        brand:
          cleanBrand,

        productCode:
          cleanModel,
      });

    if (result) {
      console.info(
        "[manual-enrichment] ✓ matched by brand + model"
      );

      return result;
    }
  }


  /*
   * 3. Groq may clean formatting.
   *
   * It never generates or chooses a manual.
   * Icecat still has to verify the product.
   */
  if (!cleanModel) {
    return null;
  }

  console.info(
    "[manual-enrichment] trying AI identity normalization"
  );

  const normalized =
    await normalizeDeviceIdentityForLookup({
      deviceName,
      brand:
        cleanBrand,
      modelNumber:
        cleanModel,
    });

  if (!normalized) {
    console.info(
      "[manual-enrichment] AI identity normalization rejected"
    );

    return null;
  }

  const sameBrand =
    normalized.brand
      .toLowerCase() ===
    cleanBrand.toLowerCase();

  const sameModel =
    normalized.modelNumber
      .toLowerCase() ===
    cleanModel.toLowerCase();

  if (
    sameBrand &&
    sameModel
  ) {
    console.info(
      "[manual-enrichment] AI identity unchanged"
    );

    return null;
  }

  console.info(
    "[manual-enrichment] trying AI-normalized identity",
    {
      brand:
        normalized.brand,

      modelNumber:
        normalized.modelNumber,

      confidence:
        normalized.confidence,
    }
  );

  const result =
    await requestManual({
      brand:
        normalized.brand,

      productCode:
        normalized.modelNumber,
    });

  if (result) {
    console.info(
      "[manual-enrichment] ✓ matched after AI normalization"
    );
  }

  return result;
}

async function downloadIcecatManual(
  manualUrl: string,
  contentToken: string
) {
  const url =
    new URL(
      manualUrl
    );

  /*
   * Icecat documents that content_token
   * may be supplied to product assets.
   * This happens only server-side.
   */
  url.searchParams.set(
    "content_token",
    contentToken
  );

  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          Accept:
            "application/pdf",
        },

        cache:
          "no-store",

        redirect:
          "error",

        signal:
          AbortSignal.timeout(
            12_000
          ),
      }
    );

  if (!response.ok) {
    console.warn(
      "Icecat manual download failed:",
      response.status
    );

    return null;
  }

  const contentLength =
    Number(
      response.headers.get(
        "content-length"
      ) ?? "0"
    );

  if (
    Number.isFinite(
      contentLength
    ) &&
    contentLength >
      AUTO_MANUAL_MAX_BYTES
  ) {
    console.warn(
      "Icecat manual exceeds 15 MB."
    );

    return null;
  }

  const arrayBuffer =
    await response.arrayBuffer();

  if (
    arrayBuffer.byteLength <= 0 ||
    arrayBuffer.byteLength >
      AUTO_MANUAL_MAX_BYTES
  ) {
    return null;
  }

  /*
   * Verify the actual PDF signature,
   * not only the HTTP MIME header.
   */
  const firstBytes =
    new Uint8Array(
      arrayBuffer.slice(
        0,
        5
      )
    );

  const pdfSignature =
    String.fromCharCode(
      ...firstBytes
    );

  if (
    pdfSignature !==
    "%PDF-"
  ) {
    console.warn(
      "Downloaded Icecat manual was not a valid PDF."
    );

    return null;
  }

  return new Uint8Array(
    arrayBuffer
  );
}

async function saveIcecatManualForDevice({
  supabase,
  admin,
  userId,
  householdId,
  deviceId,
  deviceName,
  brand,
  modelNumber,
  productUpc,
}: {
  supabase: Awaited<
    ReturnType<
      typeof createClient
    >
  >;

  admin: ReturnType<
    typeof createAdminClient
  >;

  userId: string;
  householdId: string | null;
  deviceId: string;
  deviceName: string;
  brand: string;
  modelNumber: string;
  productUpc?: string;
}): Promise<
  "found" |
  "not_found" |
  "skipped"
> {
  /*
   * Respect the same server-side
   * document quota used by normal uploads.
   */
  try {
    await assertCanAddDocument(
      admin,
      userId
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      HouseholdQuotaError
    ) {
      console.warn(
        "Automatic manual skipped because document quota was reached."
      );

      return "skipped";
    }

    throw error;
  }

  /*
   * Avoid duplicate manuals if an action
   * is retried or the same device is saved
   * more than once.
   */
  const {
    data: existingManual,
  } =
    await supabase
      .from(
        "device_documents"
      )
      .select("id")
      .eq(
        "device_id",
        deviceId
      )
      .eq(
        "document_type",
        "Manual"
      )
      .limit(1)
      .maybeSingle();

  if (
    existingManual
  ) {
    return "found";
  }

  let pdf:
    | Uint8Array
    | null =
      null;

  const result =
    await findIcecatManual({
      productUpc,
      brand,
      modelNumber,
      deviceName,
    });

  if (result) {
    const {
      manual,
      contentToken,
    } = result;

    const declaredSize =
      Number(
        manual.Size ??
          "0"
      );

    if (
      !Number.isFinite(
        declaredSize
      ) ||
      declaredSize <=
        AUTO_MANUAL_MAX_BYTES
    ) {
      pdf =
        await downloadIcecatManual(
          manual.URL!,
          contentToken
        );

      if (pdf) {
        console.info(
          "[manual-resolver] Icecat manual verified"
        );
      }
    }
  }

  if (!pdf) {
    console.info(
      "[manual-resolver] Icecat missed; trying official manufacturer web search"
    );

    pdf =
      await resolveOfficialManualPdf({
        brand,
        modelNumber,
        deviceName,
      });
  }

  if (!pdf) {
    console.info(
      "[manual-resolver] no verified manual found"
    );

    return "not_found";
  }

  const documentName =
    createManualDocumentName(
      brand,
      modelNumber,
      deviceName
    );

  const filePath =
    userId +
    "/" +
    deviceId +
    "/" +
    crypto.randomUUID() +
    ".pdf";

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        "device-documents"
      )
      .upload(
        filePath,
        pdf,
        {
          cacheControl:
            "3600",

          contentType:
            "application/pdf",

          upsert:
            false,
        }
      );

  if (
    uploadError
  ) {
    throw uploadError;
  }

  const {
    error: recordError,
  } =
    await supabase
      .from(
        "device_documents"
      )
      .insert({
        device_id:
          deviceId,

        user_id:
          userId,

        household_id:
          householdId,

        document_name:
          documentName,

        document_type:
          "Manual",

        file_path:
          filePath,

        file_size:
          pdf.byteLength,

        mime_type:
          "application/pdf",
      });

  if (
    recordError
  ) {
    await supabase.storage
      .from(
        "device-documents"
      )
      .remove([
        filePath,
      ]);

    throw recordError;
  }

  return "found";
}

export async function addDevice(
  input: AddDeviceInput
): Promise<AddDeviceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "You must be signed in to add a device.",
      code: "UNAUTHENTICATED",
    };
  }

  const admin = createAdminClient();

  try {
    await assertCanAddDevice(admin, user.id);
  } catch (error) {
    if (error instanceof HouseholdQuotaError) {
      if (error.code === "viewer_read_only") {
        return {
          success: false,
          error: error.message,
          code: "VIEWER_READ_ONLY",
        };
      }

      if (error.code === "household_device_limit") {
        return {
          success: false,
          error: error.message,
          code: "HOUSEHOLD_DEVICE_LIMIT",
        };
      }

      if (error.code === "free_device_limit") {
        return {
          success: false,
          error: error.message,
          code: "FREE_DEVICE_LIMIT",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  const validation =
    validateDeviceInput(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const normalizedInput =
    validation.data;

  const trimmedName =
    normalizedInput.deviceName;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const locationsResult =
    await applyHouseholdScope(
      supabase
        .from("devices")
        .select("location"),
      householdId,
      user.id
    );

  if (locationsResult.error) {
    console.error(
      "Error loading existing locations:",
      locationsResult.error
    );

    return {
      success: false,
      error:
        "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  const existingLocations = new Set(
    (
      (locationsResult.data || []) as {
        location: string | null;
      }[]
    )
      .map((row) =>
        row.location?.trim().toLowerCase()
      )
      .filter(Boolean)
  );

  const trimmedLocation =
    normalizedInput.location;

  const canAttemptManualLookup =
    Boolean(
      normalizedInput.productUpc?.trim() ||
      (
        (
          normalizedInput.brand ||
          normalizedInput.manufacturer
        ) &&
        normalizedInput.modelNumber
      )
    );

  const { data: createdDevice, error } = await supabase
    .from("devices")
    .insert({
      user_id: user.id,
      household_id: householdId,
      device_name: trimmedName,

      manual_status:
        canAttemptManualLookup
          ? "pending"
          : null,

      manual_checked_at:
        null,

      category:
        normalizedInput.category || null,
      brand:
        normalizedInput.brand || null,
      manufacturer:
        normalizedInput.manufacturer || null,
      model_number:
        normalizedInput.modelNumber || null,
      serial_number:
        normalizedInput.serialNumber || null,
      purchase_date:
        normalizedInput.purchaseDate,
      warranty_date:
        normalizedInput.warrantyDate,
      purchase_price:
        normalizedInput.purchasePrice,
      location:
        trimmedLocation || null,
      notes:
        normalizedInput.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    if (
      error.message.includes(
        "DEVICE_LIMIT_REACHED"
      )
    ) {
      return {
        success: false,
        error: error.message,
        code: "DEVICE_LIMIT_REACHED",
      };
    }

    console.error("Error adding device:", error);

    return {
      success: false,
      error:
        "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  if (createdDevice?.id) {
    await recordActivity({
      activityType: "device.added",
      title: getDefaultActivityTitle(
        "device.added",
        trimmedName
      ),
      description:
        "Device saved to your vault.",
      userId: user.id,
      householdId,
      deviceId: createdDevice.id,
    });

    /*
     * HTV_BACKGROUND_DEVICE_ENRICHMENT
     *
     * The device is already saved.
     * Image and manual work continues after
     * the action response is released.
     */
    after(async () => {
      /*
       * A database-matched product image is a convenience,
       * not a requirement for creating the device.
       *
       * If the remote image/CDN fails, the device still
       * remains successfully saved.
       */
      if (
        normalizedInput.productUpc
      ) {
        try {
          const productImageSaved =
            await saveMatchedProductImage({
              supabase,
              userId:
                user.id,
              householdId,
              deviceId:
                createdDevice.id,
              productUpc:
                normalizedInput.productUpc ??
                undefined,
            });

          if (
            productImageSaved
          ) {
            await recordActivity({
              activityType:
                "photo.uploaded",

              title:
                "Product photo added",

              description:
                "A matched product image was saved automatically.",

              userId:
                user.id,

              householdId,

              deviceId:
                createdDevice.id,
            });
          }
        } catch (imageError) {
          console.warn(
            "Unable to save matched product image:",
            imageError
          );
        }
      }

      /*
       * Automatically attach an official manual
       * when the device came from an exact
       * UPC/EAN database match.
       *
       * This is intentionally non-fatal:
       * a missing manual must never prevent
       * the device itself from being saved.
       */
      if (
        canAttemptManualLookup
      ) {
        try {
          const manualResult =
            await saveIcecatManualForDevice({
              supabase,
              admin,

              userId:
                user.id,

              householdId,

              deviceId:
                createdDevice.id,

              deviceName:
                trimmedName,

              brand:
                normalizedInput.brand ||
                normalizedInput.manufacturer,

              modelNumber:
                normalizedInput.modelNumber,

              productUpc:
                normalizedInput.productUpc ??
                undefined,

            });

          if (
            manualResult ===
            "found"
          ) {
            const {
              error: manualStatusError,
            } = await supabase
              .from("devices")
              .update({
                manual_status: "found",
                manual_checked_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                createdDevice.id
              );

            if (manualStatusError) {
              console.warn(
                "Unable to save manual lookup status:",
                manualStatusError
              );
            }

            await recordActivity({
              activityType:
                "document.uploaded",

              title:
                "User manual added",

              description:
                "The official product manual was found and saved automatically.",

              userId:
                user.id,

              householdId,

              deviceId:
                createdDevice.id,
            });
          } else if (
            manualResult ===
            "not_found"
          ) {
            const {
              error: manualStatusError,
            } = await supabase
              .from("devices")
              .update({
                manual_status:
                  "not_found",
                manual_checked_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                createdDevice.id
              );

            if (manualStatusError) {
              console.warn(
                "Unable to save manual lookup status:",
                manualStatusError
              );
            }
          }
        } catch (
          manualError
        ) {
          console.warn(
            "Automatic manual lookup failed:",
            manualError
          );
        }
      }

    });

    if (normalizedInput.warrantyDate) {
      await recordActivity({
        activityType: "warranty.added",
        title: getDefaultActivityTitle(
          "warranty.added",
          trimmedName
        ),
        description:
          "Warranty coverage recorded on the device.",
        userId: user.id,
        householdId,
        deviceId: createdDevice.id,
      });
    }

    if (
      trimmedLocation &&
      !existingLocations.has(
        trimmedLocation.toLowerCase()
      )
    ) {
      await recordActivity({
        activityType: "room.created",
        title: getDefaultActivityTitle(
          "room.created",
          trimmedLocation
        ),
        description:
          "A new room was created when this device was assigned a location.",
        userId: user.id,
        householdId,
        entityId: trimmedLocation,
      });
    }
  }

  revalidatePath("/devices");
  revalidatePath("/dashboard");

  if (
    createdDevice?.id
  ) {
    revalidatePath(
      `/devices/${createdDevice.id}`
    );
  }

  return {
    success: true,
    deviceId: createdDevice.id,
  };
}



export type RetryDeviceManualLookupResult =
  | {
      success: true;
      status:
        | "found"
        | "not_found"
        | "skipped";
      checkedAt: string;
      modelNumber: string;
    }
  | {
      success: false;
      error: string;
    };


export async function retryDeviceManualLookup(input: {
  deviceId: string;
  modelNumber?: string;
}): Promise<RetryDeviceManualLookupResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      success: false,
      error:
        "You must be signed in to search for a manual.",
    };
  }

  const deviceId =
    input.deviceId
      ?.trim();

  if (!deviceId) {
    return {
      success: false,
      error:
        "A device id is required.",
    };
  }

  const requestedModel =
    input.modelNumber
      ?.trim() ?? "";

  if (
    requestedModel.length >
    160
  ) {
    return {
      success: false,
      error:
        "The model number is too long.",
    };
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  /*
   * RLS + household scope determine whether
   * this user may read the device.
   */
  const deviceQuery =
    applyHouseholdScope(
      supabase
        .from("devices")
        .select(
          [
            "id",
            "device_name",
            "brand",
            "manufacturer",
            "model_number",
            "manual_status",
          ].join(",")
        )
        .eq(
          "id",
          deviceId
        ),
      householdId,
      user.id
    );

  const {
    data: device,
    error: deviceError,
  } =
    await deviceQuery
      .maybeSingle();

  if (
    deviceError ||
    !device
  ) {
    return {
      success: false,
      error:
        "This device could not be found or you do not have permission to update it.",
    };
  }

  const brand =
    String(
      device.brand ??
      device.manufacturer ??
      ""
    ).trim();

  const existingModel =
    String(
      device.model_number ??
      ""
    ).trim();

  const modelNumber =
    requestedModel ||
    existingModel;

  if (!brand) {
    return {
      success: false,
      error:
        "Add the device brand before searching for an official manual.",
    };
  }

  if (!modelNumber) {
    return {
      success: false,
      error:
        "Enter the exact model number from the product label before searching again.",
    };
  }

  /*
   * If the user supplied a more exact model,
   * save it to the Vault before searching.
   */
  if (
    requestedModel &&
    requestedModel !==
      existingModel
  ) {
    const {
      data: updatedRows,
      error: modelUpdateError,
    } =
      await applyHouseholdMutationScope(
        supabase
          .from("devices")
          .update({
            model_number:
              requestedModel,
          })
          .eq(
            "id",
            deviceId
          )
          .select("id"),
        householdId,
        user.id
      );

    if (
      modelUpdateError ||
      !updatedRows ||
      updatedRows.length === 0
    ) {
      return {
        success: false,
        error:
          "Home Tech Vault could not save the updated model number.",
      };
    }
  }

  const admin =
    createAdminClient();

  let result:
    | "found"
    | "not_found"
    | "skipped";

  try {
    /*
     * This reuses the same trusted pipeline
     * as automatic device creation:
     *
     * Brand + Model
     * -> AI formatting cleanup when useful
     * -> verified Icecat product
     * -> validated PDF
     * -> device-documents
     */
    result =
      await saveIcecatManualForDevice({
        supabase,
        admin,

        userId:
          user.id,

        householdId,

        deviceId,

        deviceName:
          String(
            device.device_name ??
            "Device"
          ).trim(),

        brand,

        modelNumber,

        productUpc:
          undefined,
      });
  } catch (error) {
    console.warn(
      "Manual retry failed:",
      error
    );

    return {
      success: false,
      error:
        "The manual search could not be completed. Please try again.",
    };
  }

  const checkedAt =
    new Date()
      .toISOString();

  /*
   * "skipped" usually means quota/access
   * prevented another document from being saved.
   * Do not overwrite the truthful existing
   * manual status in that case.
   */
  if (
    result !==
    "skipped"
  ) {
    const {
      data: statusRows,
      error: statusError,
    } =
      await applyHouseholdMutationScope(
        supabase
          .from("devices")
          .update({
            manual_status:
              result,

            manual_checked_at:
              checkedAt,
          })
          .eq(
            "id",
            deviceId
          )
          .select("id"),
        householdId,
        user.id
      );

    if (
      statusError ||
      !statusRows ||
      statusRows.length === 0
    ) {
      console.warn(
        "Unable to save retry manual status:",
        statusError
      );
    }
  }

  if (
    result ===
    "found"
  ) {
    await recordActivity({
      activityType:
        "document.uploaded",

      title:
        "User manual added",

      description:
        "An official product manual was found and saved automatically.",

      userId:
        user.id,

      householdId,

      deviceId,
    });
  }

  revalidatePath(
    `/devices/${deviceId}`
  );

  revalidatePath(
    "/documents"
  );

  return {
    success: true,
    status:
      result,
    checkedAt,
    modelNumber,
  };
}


export type UpdateDeviceInput = {
  deviceId: string;
  deviceName: string;
  category: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyDate: string;
  purchasePrice: string;
  location: string;
  notes: string;
};

export type UpdateDeviceResult =
  | {
      success: true;
      deviceId: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "NOT_FOUND_OR_FORBIDDEN"
        | "UNKNOWN";
    };

export async function updateDevice(
  input: UpdateDeviceInput
): Promise<UpdateDeviceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to update a device.",
      code: "UNAUTHENTICATED",
    };
  }

  const deviceId =
    input.deviceId.trim();

  if (!deviceId) {
    return {
      success: false,
      error: "A device id is required.",
      code: "VALIDATION_ERROR",
    };
  }

  /*
   * Edit Device does not currently expose
   * manufacturer or product UPC fields.
   *
   * We still use the same canonical validator
   * as Add Device, but leave those values blank
   * and do not overwrite them in the update.
   */
  const validation =
    validateDeviceInput({
      deviceName:
        input.deviceName,
      category:
        input.category,
      brand:
        input.brand,
      manufacturer: "",
      modelNumber:
        input.modelNumber,
      serialNumber:
        input.serialNumber,
      purchaseDate:
        input.purchaseDate,
      warrantyDate:
        input.warrantyDate,
      purchasePrice:
        input.purchasePrice,
      location:
        input.location,
      notes:
        input.notes,
    });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const normalized =
    validation.data;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const {
    data: updatedRows,
    error: updateError,
  } =
    await applyHouseholdMutationScope(
      supabase
        .from("devices")
        .update({
          device_name:
            normalized.deviceName,
          category:
            normalized.category || null,
          brand:
            normalized.brand || null,
          model_number:
            normalized.modelNumber || null,
          serial_number:
            normalized.serialNumber || null,
          purchase_date:
            normalized.purchaseDate,
          warranty_date:
            normalized.warrantyDate,
          purchase_price:
            normalized.purchasePrice,
          location:
            normalized.location || null,
          notes:
            normalized.notes || null,
        })
        .eq("id", deviceId)
        .select("id"),
      householdId,
      user.id
    );

  if (updateError) {
    console.error(
      "Error updating device:",
      updateError
    );

    return {
      success: false,
      error:
        "Unable to update this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  if (
    !updatedRows ||
    updatedRows.length === 0
  ) {
    return {
      success: false,
      error:
        "This device could not be found or you do not have permission to edit it.",
      code: "NOT_FOUND_OR_FORBIDDEN",
    };
  }

  await recordActivity({
    activityType: "device.edited",
    title: getDefaultActivityTitle(
      "device.edited",
      normalized.deviceName
    ),
    description:
      "Device details were updated.",
    userId: user.id,
    householdId,
    deviceId,
  });

  if (normalized.warrantyDate) {
    await recordActivity({
      activityType:
        "warranty.added",
      title: getDefaultActivityTitle(
        "warranty.added",
        normalized.deviceName
      ),
      description:
        "Warranty information was updated on this device.",
      userId: user.id,
      householdId,
      deviceId,
    });
  }

  revalidatePath(
    `/devices/${deviceId}`
  );
  revalidatePath("/devices");
  revalidatePath("/dashboard");
  revalidatePath("/warranties");

  return {
    success: true,
    deviceId,
  };
}
