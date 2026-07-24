export type InvitationRowLike = {
  id: string;
  email: string;
  token: string;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  first_name?: string | null;
  last_name?: string | null;
  invitation_type?: string | null;
  household_id?: string | null;
};

export function normalizeInviteEmail(value: string) {
  return value.trim().toLowerCase();
}
