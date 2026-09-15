import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

import type { VaultDocument } from '@/lib/demo-data';
import { createVaultDocumentViewUrl } from '@/lib/home-tech-vault-api';
import { colors } from '@/theme';

export async function viewVaultDocument(document: VaultDocument) {
  const signedUrl = await createVaultDocumentViewUrl(document);
  void Haptics.selectionAsync();
  await WebBrowser.openBrowserAsync(signedUrl, {
    dismissButtonStyle: 'close',
    toolbarColor: colors.navy,
    controlsColor: colors.cream,
    showTitle: true,
    enableBarCollapsing: true,
    createTask: false,
  });
}
