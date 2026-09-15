import { appleAuth } from '@invertase/react-native-apple-authentication';

import type { AppleSignInCredential } from './apple-auth';

export const appleSignInAvailable = appleAuth.isSupported;

export async function requestAppleSignIn(): Promise<AppleSignInCredential> {
  return appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });
}

export function isAppleSignInCanceled(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && String(error.code) === appleAuth.Error.CANCELED;
}
