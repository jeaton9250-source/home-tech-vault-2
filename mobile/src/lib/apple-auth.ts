export type AppleSignInCredential = {
  identityToken: string | null;
  authorizationCode: string | null;
  nonce: string;
  fullName: {
    givenName?: string | null;
    middleName?: string | null;
    familyName?: string | null;
  } | null;
};

export const appleSignInAvailable = false;

export async function requestAppleSignIn(): Promise<AppleSignInCredential> {
  throw new Error('Sign in with Apple is available in the Home Tech Vault iPhone and iPad app.');
}

export function isAppleSignInCanceled(error: unknown) {
  void error;
  return false;
}
