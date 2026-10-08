import test from 'node:test';
import assert from 'node:assert/strict';
import { removeDeletedDevice } from '../../mobile/src/lib/device-deletion-state';

test('deletion removes device-specific records and retains detached vault documents', () => {
  const state = {
    devices: [{ id: 'target' }, { id: 'other' }],
    maintenance: [{ id: 'care', deviceId: 'target' }, { id: 'other-care', deviceId: 'other' }],
    documents: [
      { id: 'receipt', deviceId: 'target', source: 'documents' },
      { id: 'manual', deviceId: 'target', source: 'official_manual' },
      { id: 'attachment', deviceId: 'target', source: 'device_documents' },
      { id: 'unrelated', deviceId: 'other', source: 'documents' },
    ],
  } as unknown as Parameters<typeof removeDeletedDevice>[0];
  const result = removeDeletedDevice(state, 'target');
  assert.deepEqual(result.devices.map(row => row.id), ['other']);
  assert.deepEqual(result.maintenance.map(row => row.id), ['other-care']);
  assert.deepEqual(result.documents.map(row => row.id), ['receipt', 'unrelated']);
  assert.equal(result.documents[0].deviceId, null);
  assert.equal(result.documents[0].deviceName, 'Whole Home');
  assert.equal(state.documents[0].deviceId, 'target');
});
