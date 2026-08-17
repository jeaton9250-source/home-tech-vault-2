import type {
  SupabaseClient,
} from "@supabase/supabase-js";

function slugifyName(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "."
    )
    .replace(
      /^\.+|\.+$/g,
      ""
    )
    .replace(
      /\.{2,}/g,
      "."
    );
}

function createFallbackBase(
  email: string
) {
  const localPart =
    email
      .split("@")[0]
      ?.trim()
      .toLowerCase();

  const cleaned =
    slugifyName(
      localPart || "home"
    );

  return (
    cleaned ||
    "home"
  );
}

function getSmartImportDomain() {
  return (
    process.env
      .SMART_IMPORT_DOMAIN ||
    "fuevwun.resend.app"
  );
}

export async function ensureReceiptAddress({
  supabase,
  userId,
  householdId,
  fullName,
  accountEmail,
}: {
  supabase: SupabaseClient;
  userId: string;
  householdId:
    | string
    | null;
  fullName?:
    | string
    | null;
  accountEmail: string;
}) {
  const domain =
    getSmartImportDomain();

  /*
    Check whether this user already
    has a Smart Import address.
  */
  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("import_addresses")
    .select(
      "id, token, email_address, household_id"
    )
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  /*
    If an address already exists,
    preserve the token but rebuild
    the email using the current domain.

    This makes switching domains later
    much easier.
  */
  if (existing) {
    const emailAddress =
      `${existing.token}@${domain}`;

    if (
      existing.email_address !==
      emailAddress
    ) {
      const {
        error: updateError,
      } = await supabase
        .from("import_addresses")
        .update({
          email_address:
            emailAddress,

          household_id:
            existing.household_id ??
            householdId,
        })
        .eq(
          "id",
          existing.id
        );

      if (updateError) {
        throw updateError;
      }
    }

    return {
      token:
        existing.token,

      emailAddress,
    };
  }

  /*
    Prefer the user's full name.

    Jason Eaton
    ->
    jason.eaton
  */
  let base =
    fullName
      ? slugifyName(
          fullName
        )
      : "";

  /*
    If no full name exists,
    fall back to the account email.

    example@gmail.com
    ->
    example
  */
  if (!base) {
    base =
      createFallbackBase(
        accountEmail
      );
  }

  /*
    Prevent huge aliases.
  */
  base =
    base.slice(
      0,
      40
    );

  /*
    Try:

    jason.eaton
    jason.eaton2
    jason.eaton3
    ...
  */
  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {
    const token =
      attempt === 0
        ? base
        : `${base}${
            attempt + 1
          }`;

    const emailAddress =
      `${token}@${domain}`;

    const {
      data,
      error,
    } = await supabase
      .from(
        "import_addresses"
      )
      .insert({
        user_id:
          userId,

        household_id:
          householdId,

        token,

        email_address:
          emailAddress,
      })
      .select(
        "token, email_address"
      )
      .single();

    if (!error && data) {
      return {
        token:
          data.token,

        emailAddress:
          data.email_address,
      };
    }

    /*
      Unique violation:
      someone already owns this alias.

      Try the next number.
    */
    if (
      error?.code ===
      "23505"
    ) {
      continue;
    }

    throw error;
  }

  throw new Error(
    "Unable to create a unique Smart Import email address."
  );
}