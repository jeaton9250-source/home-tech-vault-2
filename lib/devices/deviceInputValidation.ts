export const DEVICE_FIELD_LIMITS = {
  deviceName: 120,
  category: 80,
  brand: 100,
  manufacturer: 120,
  modelNumber: 120,
  serialNumber: 160,
  location: 120,
  notes: 2000,
} as const;

export const MAX_DEVICE_PURCHASE_PRICE =
  100_000_000;

export type DeviceInputForValidation = {
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
  productUpc?: string;
};

export type ValidatedDeviceInput = {
  deviceName: string;
  category: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string | null;
  warrantyDate: string | null;
  purchasePrice: number | null;
  location: string;
  notes: string;
  productUpc: string | null;
};

type DeviceValidationResult =
  | {
      success: true;
      data: ValidatedDeviceInput;
    }
  | {
      success: false;
      error: string;
    };

function validateText(
  value: string,
  label: string,
  maxLength: number
) {
  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    return {
      value: trimmed,
      error:
        `${label} must be ${maxLength} characters or fewer.`,
    };
  }

  return {
    value: trimmed,
    error: null,
  };
}

function normalizeIsoDate(
  value: string,
  label: string
):
  | {
      value: string | null;
      error: null;
    }
  | {
      value: null;
      error: string;
    } {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      value: null,
      error: null,
    };
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)
  ) {
    return {
      value: null,
      error: `${label} is not a valid date.`,
    };
  }

  const [year, month, day] =
    trimmed.split("-").map(Number);

  const parsed =
    new Date(
      Date.UTC(year, month - 1, day)
    );

  const valid =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!valid) {
    return {
      value: null,
      error: `${label} is not a valid date.`,
    };
  }

  return {
    value: trimmed,
    error: null,
  };
}

function normalizeBarcode(
  value: string | undefined
) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return {
      value: null,
      error: null,
    };
  }

  const digits =
    trimmed.replace(/\D/g, "");

  if (
    ![8, 12, 13, 14].includes(
      digits.length
    )
  ) {
    return {
      value: null,
      error:
        "Barcode must contain 8, 12, 13, or 14 digits.",
    };
  }

  return {
    value: digits,
    error: null,
  };
}

export function validateDeviceInput(
  input: DeviceInputForValidation
): DeviceValidationResult {
  const deviceName = validateText(
    input.deviceName,
    "Device name",
    DEVICE_FIELD_LIMITS.deviceName
  );

  if (!deviceName.value) {
    return {
      success: false,
      error: "Give this device a name.",
    };
  }

  if (deviceName.error) {
    return {
      success: false,
      error: deviceName.error,
    };
  }

  const fields = {
    category: validateText(
      input.category,
      "Category",
      DEVICE_FIELD_LIMITS.category
    ),
    brand: validateText(
      input.brand,
      "Brand",
      DEVICE_FIELD_LIMITS.brand
    ),
    manufacturer: validateText(
      input.manufacturer,
      "Manufacturer",
      DEVICE_FIELD_LIMITS.manufacturer
    ),
    modelNumber: validateText(
      input.modelNumber,
      "Model",
      DEVICE_FIELD_LIMITS.modelNumber
    ),
    serialNumber: validateText(
      input.serialNumber,
      "Serial number",
      DEVICE_FIELD_LIMITS.serialNumber
    ),
    location: validateText(
      input.location,
      "Location",
      DEVICE_FIELD_LIMITS.location
    ),
    notes: validateText(
      input.notes,
      "Notes",
      DEVICE_FIELD_LIMITS.notes
    ),
  };

  for (
    const field of Object.values(fields)
  ) {
    if (field.error) {
      return {
        success: false,
        error: field.error,
      };
    }
  }

  const purchaseDate =
    normalizeIsoDate(
      input.purchaseDate,
      "Purchase date"
    );

  if (purchaseDate.error) {
    return {
      success: false,
      error: purchaseDate.error,
    };
  }

  const warrantyDate =
    normalizeIsoDate(
      input.warrantyDate,
      "Warranty date"
    );

  if (warrantyDate.error) {
    return {
      success: false,
      error: warrantyDate.error,
    };
  }

  let purchasePrice: number | null =
    null;

  const rawPrice =
    input.purchasePrice.trim();

  if (rawPrice) {
    const parsedPrice =
      Number(rawPrice);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return {
        success: false,
        error:
          "Purchase price must be a valid non-negative amount.",
      };
    }

    if (
      parsedPrice >
      MAX_DEVICE_PURCHASE_PRICE
    ) {
      return {
        success: false,
        error:
          "Purchase price is too large.",
      };
    }

    purchasePrice = parsedPrice;
  }

  const barcode =
    normalizeBarcode(
      input.productUpc
    );

  if (barcode.error) {
    return {
      success: false,
      error: barcode.error,
    };
  }

  return {
    success: true,
    data: {
      deviceName:
        deviceName.value,
      category:
        fields.category.value,
      brand:
        fields.brand.value,
      manufacturer:
        fields.manufacturer.value,
      modelNumber:
        fields.modelNumber.value,
      serialNumber:
        fields.serialNumber.value,
      purchaseDate:
        purchaseDate.value,
      warrantyDate:
        warrantyDate.value,
      purchasePrice,
      location:
        fields.location.value,
      notes:
        fields.notes.value,
      productUpc:
        barcode.value,
    },
  };
}
