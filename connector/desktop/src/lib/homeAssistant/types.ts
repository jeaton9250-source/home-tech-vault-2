export type HomeAssistantConfig = {
  baseUrl: string;
  accessToken: string;
};

export type HomeAssistantState = {
  entity_id: string;
  state: string;

  attributes: Record<
    string,
    unknown
  >;

  last_changed: string;
  last_reported?: string;
  last_updated: string;
};

export type NormalizedHomeAssistantEntity = {
  entityId: string;
  domain: string;
  objectId: string;

  name: string;
  state: string;

  deviceClass: string | null;
  unitOfMeasurement: string | null;

  available: boolean;

  attributes: Record<
    string,
    unknown
  >;

  lastChangedAt: string | null;
  lastUpdatedAt: string | null;
};

export type GroupedHomeAssistantDevice = {
  localFingerprint: string;

  name: string;
  provider: "home_assistant";

  primaryState: string;
  available: boolean;

  manufacturer: string | null;
  model: string | null;
  deviceType: string | null;

  domains: string[];

  entities:
    NormalizedHomeAssistantEntity[];

  entityCount: number;
};