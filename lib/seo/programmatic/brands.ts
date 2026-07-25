export type BrandCategory =
  | "computing"
  | "mobile"
  | "tv"
  | "networking"
  | "smart-home"
  | "audio"
  | "gaming"
  | "printing"
  | "streaming";

export type SeoBrand = {
  slug: string;
  name: string;
  /** Short phrase used in copy (“Apple devices”, “your Nest gear”) */
  possessiveLabel: string;
  categories: BrandCategory[];
  /** Primary product nouns this brand is known for in homes */
  products: string[];
  /** Ecosystem / account system households actually deal with */
  ecosystem: string;
  /** Concrete details that make brand pages unique */
  facts: string[];
  /** Typical fields worth capturing for this brand */
  recordFields: string[];
  /** Common household friction for this brand */
  friction: string[];
};

/**
 * Major consumer device brands for programmatic SEO guides.
 */
export const SEO_BRANDS: SeoBrand[] = [
  {
    slug: "apple",
    name: "Apple",
    possessiveLabel: "Apple devices",
    categories: ["computing", "mobile", "tv", "audio", "smart-home", "streaming"],
    products: ["iPhone", "iPad", "Mac", "Apple TV", "HomePod", "Apple Watch"],
    ecosystem: "Apple ID / iCloud",
    facts: [
      "Many households share a tangle of personal Apple IDs and one unpaid Family Sharing group.",
      "Serial numbers live in Settings, About This Mac, or engraved on the device.",
      "AppleCare+ dates matter more than the retail receipt once the first year ends.",
    ],
    recordFields: [
      "Apple ID email on the device",
      "model identifier (not just marketing name)",
      "serial number",
      "AppleCare status and end date",
      "Find My enrollment",
    ],
    friction: [
      "Nobody remembers which Apple ID owns which iPad.",
      "Trade-in and support chats stall without the serial.",
      "HomeKit accessories vanish from memory when a hub changes.",
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    possessiveLabel: "Samsung devices",
    categories: ["mobile", "tv", "smart-home", "computing", "audio"],
    products: ["Galaxy phone", "Galaxy tablet", "Samsung TV", "soundbar", "SmartThings hub", "washer"],
    ecosystem: "Samsung account / SmartThings",
    facts: [
      "Samsung TVs and phones often sit on different accounts than the SmartThings home.",
      "TV model codes look cryptic but unlock manuals, firmware notes, and parts.",
      "SmartThings device lists drift when people leave the household.",
    ],
    recordFields: [
      "Samsung account email",
      "TV model and software version",
      "SmartThings location name",
      "serial / service tag",
      "warranty registration status",
    ],
    friction: [
      "The living-room TV account is still an old email address.",
      "Remote codes and One Connect box details get lost in a move.",
      "Appliance warranties expire unnoticed.",
    ],
  },
  {
    slug: "lg",
    name: "LG",
    possessiveLabel: "LG devices",
    categories: ["tv", "smart-home", "computing"],
    products: ["LG OLED TV", "LG soundbar", "LG washer", "LG dryer", "LG monitor"],
    ecosystem: "LG account / ThinQ",
    facts: [
      "webOS TVs store apps and profiles that survivors of a factory reset wish they had noted.",
      "ThinQ appliances and TVs may not share one clean household story.",
      "Panel and chassis serials are easy to miss until a service visit.",
    ],
    recordFields: [
      "LG account email",
      "TV model and webOS version",
      "ThinQ home nickname",
      "serial number",
      "purchase date and retailer",
    ],
    friction: [
      "Magic Remote pairing notes never get written down.",
      "Washer error history lives only in an app until the phone changes.",
      "Extended TV panel coverage needs proof of purchase.",
    ],
  },
  {
    slug: "sony",
    name: "Sony",
    possessiveLabel: "Sony devices",
    categories: ["tv", "audio", "gaming", "mobile", "computing"],
    products: ["Bravia TV", "PlayStation", "WH headphones", "soundbar", "Alpha camera", "Xperia"],
    ecosystem: "Sony account / PlayStation Network",
    facts: [
      "Sony homes often mix Bravia, PlayStation, and headphones across separate logins.",
      "Camera and headphone serials matter for theft and warranty more than people expect.",
      "Bravia sync and audio settings are painful to reconstruct from memory.",
    ],
    recordFields: [
      "Sony / PSN account",
      "TV or console model",
      "serial number",
      "firmware version notes",
      "warranty and Care Pack details",
    ],
    friction: [
      "PSN and TV accounts diverge after a roommate moves out.",
      "Headphone case serials get tossed with packaging.",
      "Soundbar HDMI-eARC quirks only show up after a receiver swap.",
    ],
  },
  {
    slug: "dell",
    name: "Dell",
    possessiveLabel: "Dell devices",
    categories: ["computing"],
    products: ["XPS laptop", "Inspiron", "Dell monitor", "Alienware", "OptiPlex"],
    ecosystem: "Dell account / SupportAssist",
    facts: [
      "Dell service tags are short, unique, and perfect for support — if you capture them.",
      "Business and consumer Dell lines look similar on a desk but diverge in warranty portals.",
      "Monitor and dock model numbers disappear into cable drawers.",
    ],
    recordFields: [
      "service tag / express service code",
      "model name",
      "warranty end date",
      "owner email on Dell account",
      "dock and monitor serials",
    ],
    friction: [
      "Support asks for the service tag while the laptop is at a repair shop.",
      "ProSupport vs basic coverage is unclear without notes.",
      "Work-issued Dells mix with personal machines in one household.",
    ],
  },
  {
    slug: "hp",
    name: "HP",
    possessiveLabel: "HP devices",
    categories: ["computing", "printing"],
    products: ["HP laptop", "HP desktop", "HP monitor", "HP printer", "HP dock"],
    ecosystem: "HP account / HP Support",
    facts: [
      "HP printers and PCs rarely share one mental model even when they share a brand.",
      "Product numbers on stickers beat marketing names for driver downloads.",
      "Instant Ink and Care Pack details age out of email fast.",
    ],
    recordFields: [
      "product number",
      "serial number",
      "HP account email",
      "Care Pack / warranty end",
      "printer IP or hostname notes",
    ],
    friction: [
      "Printer setup codes live on a sticker nobody photographed.",
      "Laptop warranty status differs from the docking station.",
      "Family members install drivers for the wrong model.",
    ],
  },
  {
    slug: "asus",
    name: "ASUS",
    possessiveLabel: "ASUS devices",
    categories: ["computing", "networking", "gaming"],
    products: ["ASUS laptop", "ROG device", "ASUS monitor", "ASUS router", "ASUS motherboard PC"],
    ecosystem: "ASUS account / Armoury Crate / ASUS Router app",
    facts: [
      "ASUS spans gaming laptops, monitors, and routers — households treat them as unrelated.",
      "Router admin credentials and PC serials need different storage habits.",
      "ROG and consumer lines share branding but not support paths.",
    ],
    recordFields: [
      "serial number",
      "model name",
      "ASUS account email",
      "router admin URL notes",
      "warranty registration date",
    ],
    friction: [
      "Router firmware update notes never make it next to the laptop records.",
      "Monitor warranty needs the original invoice.",
      "Gaming peripherals get gifted without serials.",
    ],
  },
  {
    slug: "acer",
    name: "Acer",
    possessiveLabel: "Acer devices",
    categories: ["computing"],
    products: ["Acer laptop", "Acer desktop", "Acer monitor", "Predator"],
    ecosystem: "Acer ID",
    facts: [
      "Acer SNID and serial pairs speed up support when both are on file.",
      "School and home Acer laptops often share a kitchen table and nothing else.",
      "Predator and Aspire warranties are easy to confuse without labels.",
    ],
    recordFields: [
      "serial number",
      "SNID",
      "model number",
      "Acer ID email",
      "warranty end date",
    ],
    friction: [
      "The SNID sticker wears off before the warranty does.",
      "Student devices change hands without documentation.",
      "Monitor boxes get recycled with the only clear model printout.",
    ],
  },
  {
    slug: "lenovo",
    name: "Lenovo",
    possessiveLabel: "Lenovo devices",
    categories: ["computing"],
    products: ["ThinkPad", "Yoga", "IdeaPad", "Legion", "Lenovo monitor", "ThinkCentre"],
    ecosystem: "Lenovo ID / Lenovo Vantage",
    facts: [
      "Machine type-model and serial together unlock Lenovo support correctly.",
      "ThinkPad and IdeaPad households mix work and personal warranties.",
      "Lenovo Vantage can show warranty status — if you noted the right machine.",
    ],
    recordFields: [
      "machine type-model",
      "serial number",
      "Lenovo ID",
      "warranty / Premier Support status",
      "dock model",
    ],
    friction: [
      "Work ThinkPads and home Yogas share a bag and confuse ownership.",
      "Dock firmware issues need the dock serial, not the laptop’s.",
      "Battery replacement eligibility depends on coverage notes.",
    ],
  },
  {
    slug: "netgear",
    name: "Netgear",
    possessiveLabel: "Netgear gear",
    categories: ["networking"],
    products: ["Orbi", "Nighthawk router", "Netgear switch", "Netgear modem", "Netgear access point"],
    ecosystem: "Netgear account / Nighthawk or Orbi app",
    facts: [
      "Orbi satellite placements matter as much as the admin password.",
      "ISP modem/router combos and Netgear gateways get swapped without notes.",
      "Circle and Armor subscription dates confuse people during outages.",
    ],
    recordFields: [
      "admin username hint (not raw password in plain notes if avoidable)",
      "Wi-Fi SSID names",
      "Orbi node locations",
      "serial / MAC for ISP support",
      "firmware version last checked",
    ],
    friction: [
      "Only one person knows the admin password.",
      "Satellite labels peel off in a utility closet.",
      "Guest Wi-Fi details live in a text thread from 2019.",
    ],
  },
  {
    slug: "tp-link",
    name: "TP-Link",
    possessiveLabel: "TP-Link gear",
    categories: ["networking", "smart-home"],
    products: ["Deco mesh", "Archer router", "TP-Link switch", "Kasa plug", "Omada access point"],
    ecosystem: "TP-Link ID / Deco or Tether / Kasa",
    facts: [
      "Deco and Kasa can sit under different TP-Link IDs in the same house.",
      "Mesh node maps are useless if rooms are named inconsistently.",
      "Omada and home Deco installs need different documentation depth.",
    ],
    recordFields: [
      "TP-Link ID email",
      "Deco network name",
      "node room locations",
      "admin recovery notes",
      "Kasa device rooms",
    ],
    friction: [
      "A parent’s TP-Link ID owns every plug and nobody else can manage them.",
      "Deco unit A/B/C labels do not match physical rooms.",
      "ISP bridge mode settings get lost after a power outage reset.",
    ],
  },
  {
    slug: "google-nest",
    name: "Google Nest",
    possessiveLabel: "Google Nest devices",
    categories: ["smart-home", "audio", "streaming"],
    products: ["Nest Hub", "Nest Mini", "Nest Thermostat", "Nest Cam", "Nest Wifi", "Chromecast"],
    ecosystem: "Google account / Home app",
    facts: [
      "Home app structure (homes, rooms, members) is the real inventory layer.",
      "Nest Wifi and Nest speakers often share an account history worth documenting.",
      "Camera event history and shared access confuse guests and house sitters.",
    ],
    recordFields: [
      "Google account that owns the Home",
      "home and room names",
      "device nicknames",
      "Nest Wifi point locations",
      "shared member emails",
    ],
    friction: [
      "A former roommate still appears as a Home member.",
      "Thermostat installer codes were never saved.",
      "Speaker rooms renamed for routines break documentation.",
    ],
  },
  {
    slug: "ring",
    name: "Ring",
    possessiveLabel: "Ring devices",
    categories: ["smart-home"],
    products: ["Ring Video Doorbell", "Ring Camera", "Ring Alarm", "Ring Chime", "Ring Bridge"],
    ecosystem: "Ring account / Ring app",
    facts: [
      "Shared Users and Guest Users solve different problems — households mix them up.",
      "Battery doorbell serials and mount locations matter after paint or siding work.",
      "Alarm base station backups and monitoring plan dates are claim-relevant.",
    ],
    recordFields: [
      "Ring account email",
      "device locations",
      "serial numbers",
      "monitoring plan status",
      "shared user list",
    ],
    friction: [
      "House sitters need access without full account ownership.",
      "Chime and doorbell pairing notes disappear.",
      "Neighborhood and app notification settings get rebuilt after every phone upgrade.",
    ],
  },
  {
    slug: "eufy",
    name: "Eufy",
    possessiveLabel: "Eufy devices",
    categories: ["smart-home"],
    products: ["EufyCam", "Eufy doorbell", "Eufy robot vacuum", "Eufy HomeBase", "Eufy sensor"],
    ecosystem: "eufy Security / eufyLife accounts",
    facts: [
      "HomeBase-centric camera systems need the hub documented first.",
      "Local storage habits differ from cloud-first brands — note where footage lives.",
      "Vacuum and security product lines may use separate apps.",
    ],
    recordFields: [
      "account email",
      "HomeBase location",
      "camera positions",
      "storage mode (local/cloud)",
      "serial numbers",
    ],
    friction: [
      "HomeBase buried in a closet with no label.",
      "Vacuum maps reset after a move with no floor notes.",
      "Family members install a second account by mistake.",
    ],
  },
  {
    slug: "ubiquiti",
    name: "Ubiquiti",
    possessiveLabel: "Ubiquiti gear",
    categories: ["networking"],
    products: ["UniFi Dream Machine", "UniFi access point", "UniFi switch", "UniFi camera", "UISP radio"],
    ecosystem: "UniFi OS / UI account",
    facts: [
      "Controller hostname and local admin access matter when the cloud login fails.",
      "AP names and switch port profiles turn into tribal knowledge.",
      "Protect cameras add another inventory layer beside networking gear.",
    ],
    recordFields: [
      "console model and hostname",
      "UI account email",
      "AP names and rooms",
      "VLAN / SSID notes at a high level",
      "camera names and locations",
    ],
    friction: [
      "Only one person can adopt devices into the site.",
      "Spare APs sit unlabeled in a drawer.",
      "ISP handoff settings live only in a screenshot on a phone.",
    ],
  },
  {
    slug: "canon",
    name: "Canon",
    possessiveLabel: "Canon devices",
    categories: ["printing", "computing"],
    products: ["Canon printer", "Canon PIXMA", "Canon imageCLASS", "Canon camera", "Canon scanner"],
    ecosystem: "Canon ID / Canon PRINT",
    facts: [
      "Printers and cameras share a brand but not household workflows.",
      "Ink subscription and warranty registration emails get buried.",
      "Service IDs on printers unlock toner and maintenance kits.",
    ],
    recordFields: [
      "model name",
      "serial number",
      "Canon ID",
      "purchase date",
      "ink/toner program notes",
    ],
    friction: [
      "Wi-Fi printers reconnect to the wrong SSID after a router swap.",
      "Camera kit lens serials never get recorded.",
      "Office printers lack a clear owner in a shared home office.",
    ],
  },
  {
    slug: "brother",
    name: "Brother",
    possessiveLabel: "Brother devices",
    categories: ["printing"],
    products: ["Brother laser printer", "Brother inkjet", "Brother label maker", "Brother scanner"],
    ecosystem: "Brother account / Mobile Connect",
    facts: [
      "Brother lasers are common in home offices that never document drum life notes.",
      "Network printers need hostname/IP notes after mesh upgrades.",
      "Label makers are small, gift-prone, and easy to lose track of.",
    ],
    recordFields: [
      "model number",
      "serial number",
      "network name / IP notes",
      "drum and toner types",
      "warranty end date",
    ],
    friction: [
      "Toner SKUs get guessed wrong without the model on file.",
      "Scan-to-folder settings break after a PC replacement.",
      "Shared home-office ownership is unclear.",
    ],
  },
  {
    slug: "epson",
    name: "Epson",
    possessiveLabel: "Epson devices",
    categories: ["printing"],
    products: ["Epson EcoTank", "Epson WorkForce", "Epson Expression", "Epson scanner", "Epson projector"],
    ecosystem: "Epson account / Epson Connect",
    facts: [
      "EcoTank fill dates and bottle batches help when print quality dips.",
      "Epson Connect emails and printer email aliases are forgotten quickly.",
      "Projectors add lamp-hour style maintenance notes households skip.",
    ],
    recordFields: [
      "model name",
      "serial number",
      "Epson Connect address",
      "ink system type",
      "warranty registration",
    ],
    friction: [
      "EcoTank bottles get tossed before anyone logs the first fill.",
      "Wireless setup sheets stay in the recycling bin.",
      "Projectors move rooms without updated inventory locations.",
    ],
  },
  {
    slug: "bose",
    name: "Bose",
    possessiveLabel: "Bose devices",
    categories: ["audio", "smart-home"],
    products: ["Bose QuietComfort", "Bose SoundLink", "Bose Smart Speaker", "Bose soundbar", "Bose frames"],
    ecosystem: "Bose account / Bose app",
    facts: [
      "Headphones and soundbars share branding but different warranty portals.",
      "Product registration emails are the usual proof trail.",
      "Smart speaker room names should match how the household actually talks.",
    ],
    recordFields: [
      "model name",
      "serial number",
      "Bose account email",
      "purchase date",
      "room / assigned person",
    ],
    friction: [
      "Left/right bud cases get mixed across family members.",
      "Soundbar calibration notes vanish after a TV upgrade.",
      "Gifted QuietComfort units arrive without receipts.",
    ],
  },
  {
    slug: "sonos",
    name: "Sonos",
    possessiveLabel: "Sonos devices",
    categories: ["audio", "smart-home"],
    products: ["Sonos Era", "Sonos One", "Sonos Beam", "Sonos Sub", "Sonos Roam", "Sonos Amp"],
    ecosystem: "Sonos account / Sonos app",
    facts: [
      "Room naming is half the inventory — inconsistent names break guest instructions.",
      "Trueplay and surround layouts are hard to rebuild from memory.",
      "Sonos system ownership transfers need documentation when someone moves out.",
    ],
    recordFields: [
      "Sonos account email",
      "room names",
      "speaker models per room",
      "serial numbers",
      "surround / sub pairings",
    ],
    friction: [
      "A bedroom speaker still belongs to an old account.",
      "Beam + surrounds get rearranged after furniture moves.",
      "Recycle Mode and trade-up eligibility need serials.",
    ],
  },
  {
    slug: "roku",
    name: "Roku",
    possessiveLabel: "Roku devices",
    categories: ["streaming", "tv"],
    products: ["Roku Streaming Stick", "Roku Ultra", "Roku TV", "Roku Streambar"],
    ecosystem: "Roku account",
    facts: [
      "One Roku account can pin every stick and TV — or fracture across family emails.",
      "Channel PIN and purchase PIN notes prevent surprise charges.",
      "Remote pairing and voice remote batteries belong in maintenance notes.",
    ],
    recordFields: [
      "Roku account email",
      "device name and room",
      "model / serial if available",
      "PIN settings notes",
      "linked streaming services list",
    ],
    friction: [
      "Guest mode and kids profiles get rebuilt every holiday.",
      "Old sticks remain linked after they fail.",
      "TV and stick accounts diverge in the same living room.",
    ],
  },
  {
    slug: "fire-tv",
    name: "Fire TV",
    possessiveLabel: "Fire TV devices",
    categories: ["streaming", "tv", "smart-home"],
    products: ["Fire TV Stick", "Fire TV Cube", "Fire TV", "Fire TV Soundbar"],
    ecosystem: "Amazon account",
    facts: [
      "Amazon Household and Fire profiles control who can buy and watch.",
      "Stick generations look identical in a drawer without labels.",
      "Alexa device lists and Fire TV rooms should match physical rooms.",
    ],
    recordFields: [
      "Amazon account email",
      "device name",
      "software generation notes",
      "room assignment",
      "linked Alexa devices",
    ],
    friction: [
      "Someone else’s Amazon account owns the living-room stick.",
      "Kids profiles and content restrictions need written norms.",
      "4K vs HD sticks get mixed after a move.",
    ],
  },
  {
    slug: "xbox",
    name: "Xbox",
    possessiveLabel: "Xbox devices",
    categories: ["gaming", "streaming"],
    products: ["Xbox Series X", "Xbox Series S", "Xbox controller", "Xbox headset"],
    ecosystem: "Microsoft account / Xbox network",
    facts: [
      "Home Xbox designation affects Game Pass sharing across the household.",
      "Controller serials matter for warranty swaps more than people think.",
      "Storage upgrades and external drives need inventory notes.",
    ],
    recordFields: [
      "Microsoft account",
      "console serial",
      "Home Xbox status",
      "Game Pass type and renewal",
      "controller count and owners",
    ],
    friction: [
      "Guests sign in and change the Home Xbox by accident.",
      "Extra controllers vanish without owner labels.",
      "Warranty replacements need proof of purchase fast.",
    ],
  },
  {
    slug: "playstation",
    name: "PlayStation",
    possessiveLabel: "PlayStation devices",
    categories: ["gaming", "streaming"],
    products: ["PS5", "PS5 Digital", "DualSense", "PlayStation Portal", "PULSE headset"],
    ecosystem: "PlayStation Network",
    facts: [
      "Primary console setting changes who can play whose games offline.",
      "DualSense pairings and kids accounts need clearer household notes.",
      "Console serials sit on the back panel — photograph them early.",
    ],
    recordFields: [
      "PSN account",
      "console serial",
      "primary console designation",
      "Plus subscription status",
      "controller owners",
    ],
    friction: [
      "Family member accounts share a console without documented roles.",
      "Digital vs disc edition confusion during support chats.",
      "Portal and console ownership split across rooms.",
    ],
  },
];

export function getSeoBrand(slug: string): SeoBrand | null {
  return SEO_BRANDS.find((brand) => brand.slug === slug) ?? null;
}

export function brandsByCategory(
  category: BrandCategory
): SeoBrand[] {
  return SEO_BRANDS.filter((brand) =>
    brand.categories.includes(category)
  );
}
