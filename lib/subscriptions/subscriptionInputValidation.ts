export const SUBSCRIPTION_FIELD_LIMITS = {
  serviceName: 120,
  category: 80,
  notes: 2000,
} as const;

export const MAX_SUBSCRIPTION_MONTHLY_COST =
  1_000_000;

export const SUBSCRIPTION_BILLING_CYCLES = [
  "Monthly",
  "Yearly",
  "Quarterly",
  "Weekly",
] as const;

export type SubscriptionBillingCycle =
  (typeof SUBSCRIPTION_BILLING_CYCLES)[number];

export type SubscriptionInputForValidation = {
  serviceName: string;
  category: string;
  monthlyCost: string;
  renewalDate: string;
  billingCycle: string;
  notes: string;
};

export type ValidatedSubscriptionInput = {
  serviceName: string;
  category: string;
  monthlyCost: number;
  renewalDate: string | null;
  billingCycle: SubscriptionBillingCycle;
  notes: string;
};

export type SubscriptionValidationResult =
  | {
      success: true;
      data: ValidatedSubscriptionInput;
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

function normalizeDate(
  value: string
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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return {
      value: null,
      error:
        "Renewal date is not a valid date.",
    };
  }

  const [year, month, day] =
    trimmed.split("-").map(Number);

  const parsed = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return {
      value: null,
      error:
        "Renewal date is not a valid date.",
    };
  }

  return {
    value: trimmed,
    error: null,
  };
}

export function validateSubscriptionInput(
  input: SubscriptionInputForValidation
): SubscriptionValidationResult {
  const serviceName = validateText(
    input.serviceName,
    "Service name",
    SUBSCRIPTION_FIELD_LIMITS.serviceName
  );

  if (!serviceName.value) {
    return {
      success: false,
      error: "Enter a service name.",
    };
  }

  if (serviceName.error) {
    return {
      success: false,
      error: serviceName.error,
    };
  }

  const category = validateText(
    input.category,
    "Category",
    SUBSCRIPTION_FIELD_LIMITS.category
  );

  if (category.error) {
    return {
      success: false,
      error: category.error,
    };
  }

  const notes = validateText(
    input.notes,
    "Notes",
    SUBSCRIPTION_FIELD_LIMITS.notes
  );

  if (notes.error) {
    return {
      success: false,
      error: notes.error,
    };
  }

  if (
    !SUBSCRIPTION_BILLING_CYCLES.includes(
      input.billingCycle as SubscriptionBillingCycle
    )
  ) {
    return {
      success: false,
      error:
        "Choose a valid billing cycle.",
    };
  }

  let monthlyCost = 0;
  const rawCost = input.monthlyCost.trim();

  if (rawCost) {
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(rawCost)
    ) {
      return {
        success: false,
        error:
          "Monthly cost must be a valid amount with no more than 2 decimal places.",
      };
    }

    monthlyCost = Number(rawCost);

    if (
      !Number.isFinite(monthlyCost) ||
      monthlyCost < 0
    ) {
      return {
        success: false,
        error:
          "Monthly cost must be a non-negative amount.",
      };
    }

    if (
      monthlyCost >
      MAX_SUBSCRIPTION_MONTHLY_COST
    ) {
      return {
        success: false,
        error:
          "Monthly cost is too large.",
      };
    }
  }

  const renewalDate =
    normalizeDate(input.renewalDate);

  if (renewalDate.error) {
    return {
      success: false,
      error: renewalDate.error,
    };
  }

  return {
    success: true,
    data: {
      serviceName: serviceName.value,
      category: category.value,
      monthlyCost,
      renewalDate: renewalDate.value,
      billingCycle:
        input.billingCycle as SubscriptionBillingCycle,
      notes: notes.value,
    },
  };
}
