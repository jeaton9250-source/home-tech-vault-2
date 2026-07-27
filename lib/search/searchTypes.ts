export type SmartSearchGroup =
  | "devices"
  | "warranties"
  | "maintenance"
  | "documents"
  | "network";

export type SmartSearchMatch = {
  field: string;
  value: string;
};

export type SmartSearchItem = {
  id: string;
  group: SmartSearchGroup;
  title: string;
  subtitle?: string | null;
  location?: string | null;
  status?: string | null;
  href: string;
  match: SmartSearchMatch;
};

export type SmartSearchGroupedResults = Record<
  SmartSearchGroup,
  SmartSearchItem[]
>;

export type SmartSearchQueryIntent = {
  raw: string;
  normalized: string;
  tokens: string[];
  phrases: string[];
  wantsOffline: boolean;
  wantsOnline: boolean;
  wantsWarrantySoon: boolean;
  wantsMaintenance: boolean;
  wantsDocuments: boolean;
  wantsSerialNumber: boolean;
  olderThanYears: number | null;
  locationHint: string | null;
};

export type SmartSearchResponse = {
  success: boolean;
  query: string;
  intent: SmartSearchQueryIntent;
  results: SmartSearchGroupedResults;
  total: number;
  suggestions: string[];
  error?: string;
};

export const SMART_SEARCH_GROUP_LABELS: Record<
  SmartSearchGroup,
  string
> = {
  devices: "Devices",
  warranties: "Warranties",
  maintenance: "Maintenance",
  documents: "Documents",
  network: "Network",
};

export function emptySearchResults(): SmartSearchGroupedResults {
  return {
    devices: [],
    warranties: [],
    maintenance: [],
    documents: [],
    network: [],
  };
}
