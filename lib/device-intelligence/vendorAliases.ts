/**
 * Normalize vendor name aliases for consistent matching.
 */

export const VENDOR_ALIASES: Record<string, string> = {
  "apple, inc.": "Apple",
  apple: "Apple",
  "apple inc": "Apple",
  "amazon technologies inc.": "Amazon",
  "amazon technologies inc": "Amazon",
  amazon: "Amazon",
  "google, inc.": "Google",
  "google inc": "Google",
  google: "Google",
  "nest labs": "Google",
  "nest labs inc": "Google",
  "samsung electronics": "Samsung",
  "samsung electronics co": "Samsung",
  samsung: "Samsung",
  "lg electronics": "LG",
  "lg electronics inc": "LG",
  lg: "LG",
  "roku, inc.": "Roku",
  "roku inc": "Roku",
  roku: "Roku",
  "sonos, inc.": "Sonos",
  "sonos inc": "Sonos",
  sonos: "Sonos",
  "tp-link technologies": "TP-Link",
  "tp-link technologies co": "TP-Link",
  "tp-link": "TP-Link",
  tplink: "TP-Link",
  "signify netherlands b.v.": "Philips Hue",
  "signify netherlands b v": "Philips Hue",
  "philips lighting": "Philips Hue",
  "philips hue": "Philips Hue",
  "raspberry pi trading ltd": "Raspberry Pi",
  "raspberry pi foundation": "Raspberry Pi",
  "espressif inc.": "Espressif",
  "espressif inc": "Espressif",
  espressif: "Espressif",
  microsoft: "Microsoft",
  "sony interactive": "Sony",
  "sony corporation": "Sony",
  sony: "Sony",
  nintendo: "Nintendo",
  ubiquiti: "Ubiquiti",
  "ubiquiti networks": "Ubiquiti",
  synology: "Synology",
  netgear: "Netgear",
  belkin: "Belkin",
  asus: "ASUS",
  realtek: "Realtek",
};

function canonicalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeVendorName(
  value: string | null | undefined
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const key = canonicalizeKey(value);
  const aliased = VENDOR_ALIASES[key];

  if (aliased) {
    return aliased;
  }

  // Title-case fallback for unknown vendors
  return value
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 3 && part === part.toUpperCase()) {
        return part;
      }
      return (
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
      );
    })
    .join(" ");
}
