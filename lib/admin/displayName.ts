export function getAdminUserDisplayName(user: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) {
  const combinedName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.fullName?.trim() ||
    combinedName ||
    user.email?.split("@")[0] ||
    "Home Tech Vault User"
  );
}

export function formatAdminHouseholdLabel(input: {
  householdName?: string | null;
  householdId?: string | null;
}) {
  if (input.householdName?.trim()) {
    return input.householdName.trim();
  }

  if (input.householdId) {
    return input.householdId;
  }

  return "Setup incomplete";
}
