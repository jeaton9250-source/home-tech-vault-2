export const PROFILE_FIELD_LIMITS = {
  fullName: 120,
  householdName: 120,
  city: 120,
  phone: 40,
} as const;

export type ProfileInput = {
  fullName: string;
  householdName: string;
  city: string;
  phone: string;
};

export type ValidatedProfileInput = {
  fullName: string | null;
  householdName: string | null;
  city: string | null;
  phone: string | null;
};

export type ProfileValidationResult =
  | {
      success: true;
      data: ValidatedProfileInput;
    }
  | {
      success: false;
      error: string;
    };

function validateOptionalText(
  value: string,
  label: string,
  maxLength: number
):
  | {
      success: true;
      value: string | null;
    }
  | {
      success: false;
      error: string;
    } {
  const normalized = value.trim();

  if (!normalized) {
    return {
      success: true,
      value: null,
    };
  }

  if (normalized.length > maxLength) {
    return {
      success: false,
      error:
        `${label} must be ${maxLength} characters or fewer.`,
    };
  }

  if (/[\u0000-\u001F\u007F]/.test(normalized)) {
    return {
      success: false,
      error:
        `${label} contains unsupported characters.`,
    };
  }

  return {
    success: true,
    value: normalized,
  };
}

export function validateProfileInput(
  input: ProfileInput
): ProfileValidationResult {
  const fullName =
    validateOptionalText(
      input.fullName,
      "Full name",
      PROFILE_FIELD_LIMITS.fullName
    );

  if (!fullName.success) {
    return fullName;
  }

  const householdName =
    validateOptionalText(
      input.householdName,
      "Household display name",
      PROFILE_FIELD_LIMITS.householdName
    );

  if (!householdName.success) {
    return householdName;
  }

  const city =
    validateOptionalText(
      input.city,
      "City",
      PROFILE_FIELD_LIMITS.city
    );

  if (!city.success) {
    return city;
  }

  const phone =
    validateOptionalText(
      input.phone,
      "Phone number",
      PROFILE_FIELD_LIMITS.phone
    );

  if (!phone.success) {
    return phone;
  }

  return {
    success: true,
    data: {
      fullName: fullName.value,
      householdName:
        householdName.value,
      city: city.value,
      phone: phone.value,
    },
  };
}
