export function removeDeletedDevice<
  Device extends { id: string },
  Maintenance extends { id: string; deviceId?: string | null },
  Document extends { id: string; deviceId?: string | null; source?: string; deviceName: string },
>(state: {
  devices: Device[];
  maintenance: Maintenance[];
  documents: Document[];
}, deviceId: string) {
  return {
    devices: state.devices.filter((device) => device.id !== deviceId),
    maintenance: state.maintenance.filter((task) => task.deviceId !== deviceId),
    documents: state.documents.flatMap((document) => {
      if (document.deviceId !== deviceId) return [document];
      return document.source === 'documents' ? [{ ...document, deviceId: null, deviceName: 'Whole Home' }] : [];
    }),
  };
}
