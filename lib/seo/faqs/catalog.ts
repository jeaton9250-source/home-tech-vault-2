import {
  related,
  type SeoFaqRelatedLink,
} from "@/lib/seo/faqs/related";

export type SeoFaqCategory =
  | "Accounts"
  | "Devices"
  | "Documents"
  | "Network"
  | "Smart Home"
  | "Warranties"
  | "Maintenance"
  | "Family"
  | "Security"
  | "Billing"
  | "Inventory";

export type SeoFaqEntry = {
  slug: string;
  category: SeoFaqCategory;
  question: string;
  answer: string;
  related: SeoFaqRelatedLink[];
};

/**
 * 100 indexable FAQ pages at /faq/[slug].
 */
export const SEO_FAQ_ENTRIES: SeoFaqEntry[] = [
  {
    slug: "can-home-tech-vault-track-warranties",
    category: "Warranties",
    question: "Can Home Tech Vault track warranties?",
    answer: "Yes. Add coverage start and end dates, attach proof of purchase, and keep manufacturer or extended-plan details on the same device record. Reminders help you revisit expensive coverage before it expires.",
    related: related("warrantyTracker", "warrantyHabits", "bestWarranty", "proofOfPurchase"),
  },
  {
    slug: "can-families-share-devices",
    category: "Family",
    question: "Can families share devices?",
    answer: "Yes on the Family plan. Invite household members with viewer, member, or admin roles so everyone works from the same inventory without emailing spreadsheets. Owners stay in control of billing and membership.",
    related: related("familySharing", "pricing", "features", "digitalVault"),
  },
  {
    slug: "how-secure-is-home-tech-vault",
    category: "Security",
    question: "How secure is Home Tech Vault?",
    answer: "Home Tech Vault uses secure authentication, encrypted connections, and household-scoped access so members only see what they are invited to. We do not sell your vault data. Review the Trust Center for current practices.",
    related: related("trust", "privateRecords", "familySharing", "features"),
  },
  {
    slug: "can-i-upload-receipts",
    category: "Documents",
    question: "Can I upload receipts?",
    answer: "Yes. Upload receipt PDFs or photos and attach them to the device they belong to. That keeps proof searchable for returns, warranties, and insurance without digging through email.",
    related: related("documentOrganizer", "proofOfPurchase", "unbox", "warrantyTracker"),
  },
  {
    slug: "can-i-store-manuals",
    category: "Documents",
    question: "Can I store manuals?",
    answer: "Yes. Attach manuals and setup guides to each device record so the household can find them when something needs a reset or a part number. PDF and common image formats are supported.",
    related: related("documentOrganizer", "digitalVault", "inventoryGuide", "unbox"),
  },
  {
    slug: "can-i-track-wifi-passwords",
    category: "Network",
    question: "Can I track Wi-Fi passwords?",
    answer: "Store SSID names and network context in your vault, and keep actual passphrases in a password manager. Home Tech Vault is built for household documentation—not as a replacement for secret storage—while still helping family members find the right network details.",
    related: related("wifiGuide", "routerPasswordsGuide", "networkDocs", "privateRecords"),
  },
  {
    slug: "can-i-organize-smart-home-devices",
    category: "Smart Home",
    question: "Can I organize smart home devices?",
    answer: "Yes. Inventory hubs, sensors, cameras, speakers, and other connected gear by room and account owner. Home Tech Vault sits above vendor apps so the household has one clear list.",
    related: related("smartHome", "smartHomeKnowledge", "smartHomeGuide", "deviceInventory"),
  },
  {
    slug: "do-i-need-an-account-to-try-it",
    category: "Accounts",
    question: "Do I need an account to try Home Tech Vault?",
    answer: "No. Open the interactive demo to explore a sample vault with no signup. Create a free account when you are ready to save your own household inventory.",
    related: related("demo", "signup", "features", "homeInventory"),
  },
  {
    slug: "how-many-devices-can-i-track",
    category: "Devices",
    question: "How many devices can I track?",
    answer: "The Free plan includes up to 8 devices. Pro and Family plans include unlimited devices so growing households are not forced into another spreadsheet.",
    related: related("pricing", "deviceInventory", "inventoryGuide", "features"),
  },
  {
    slug: "can-i-organize-devices-by-room",
    category: "Devices",
    question: "Can I organize devices by room?",
    answer: "Yes. Assign devices to rooms so your inventory matches how your home is laid out. That makes audits, moves, and family handoffs much easier.",
    related: related("deviceInventory", "inventoryGuide", "smartHomeKnowledge", "features"),
  },
  {
    slug: "what-file-types-can-i-upload",
    category: "Documents",
    question: "What file types can I upload?",
    answer: "Common document formats including PDF and images are supported. Files stay linked to the device or household record they belong to.",
    related: related("documentOrganizer", "proofOfPurchase", "digitalVault", "features"),
  },
  {
    slug: "is-there-a-free-plan",
    category: "Billing",
    question: "Is there a free plan?",
    answer: "Yes. Free includes up to 8 devices and 25 documents with no credit card required. Upgrade to Pro or Family when you need unlimited capacity or household sharing.",
    related: related("pricing", "signup", "features", "bestInventory"),
  },
  {
    slug: "what-is-the-difference-between-free-pro-and-family",
    category: "Billing",
    question: "What is the difference between Free, Pro, and Family?",
    answer: "Free is for getting started with limited devices and documents. Pro unlocks unlimited inventory and advanced capabilities. Family includes Pro features plus household sharing with roles.",
    related: related("pricing", "features", "familySharing", "signup"),
  },
  {
    slug: "can-i-cancel-anytime",
    category: "Billing",
    question: "Can I cancel anytime?",
    answer: "Yes. Manage paid subscriptions from billing settings. Your data remains accessible according to your current plan limits after changes.",
    related: related("pricing", "trust", "features", "signup"),
  },
  {
    slug: "can-i-switch-plans-later",
    category: "Billing",
    question: "Can I switch plans later?",
    answer: "Yes. Start on Free and upgrade to Pro or Family whenever capacity or sharing needs change. Downgrades and billing changes are handled from account settings.",
    related: related("pricing", "features", "familySharing", "signup"),
  },
  {
    slug: "who-can-see-my-information",
    category: "Security",
    question: "Who can see my information?",
    answer: "Only you and household members you explicitly invite on Family plans. Role-based permissions control who can view or edit records.",
    related: related("familySharing", "trust", "privateRecords", "pricing"),
  },
  {
    slug: "can-i-invite-viewers",
    category: "Family",
    question: "Can I invite viewers?",
    answer: "Yes on Family. Viewer roles can read inventory without creating, editing, or deleting records—useful for partners or helpers who need visibility only.",
    related: related("familySharing", "pricing", "features", "digitalVault"),
  },
  {
    slug: "what-household-roles-are-available",
    category: "Family",
    question: "What household roles are available?",
    answer: "Viewer, member, and admin roles let you control who can see inventory, add devices, upload documents, or manage household settings.",
    related: related("familySharing", "pricing", "features", "trust"),
  },
  {
    slug: "can-i-track-serial-numbers",
    category: "Devices",
    question: "Can I track serial numbers?",
    answer: "Yes. Store serials and model identifiers on each device, and attach a photo of the label when it helps. Serials unlock support tickets, warranties, and insurance claims.",
    related: related("serials", "deviceInventory", "insuranceDocs", "unbox"),
  },
  {
    slug: "can-i-attach-photos-to-devices",
    category: "Devices",
    question: "Can I attach photos to devices?",
    answer: "Yes. Photo attachments help with insurance packets, identifying lookalike gear, and capturing serial labels before packaging disappears.",
    related: related("insuranceDocs", "deviceInventory", "documentOrganizer", "serials"),
  },
  {
    slug: "does-home-tech-vault-store-network-details",
    category: "Network",
    question: "Does Home Tech Vault store network details?",
    answer: "Yes. Keep router information, Wi-Fi notes, ISP account context, and related device records in one place—especially helpful during outages or handoffs.",
    related: related("networkDocs", "networkGuide", "wifiGuide", "routerPasswordsGuide"),
  },
  {
    slug: "is-network-monitoring-on-every-plan",
    category: "Network",
    question: "Is network monitoring included on every plan?",
    answer: "Basic network documentation is available across plans. Advanced network monitoring capabilities are included with Pro and Family.",
    related: related("pricing", "networkDocs", "features", "networkGuide"),
  },
  {
    slug: "can-i-document-my-router",
    category: "Network",
    question: "Can I document my router?",
    answer: "Yes. Create records for routers and mesh nodes with locations, model details, and account context. Pair that with a password manager for admin credentials.",
    related: related("networkGuide", "routerPasswordsGuide", "networkDocs", "wifiGuide"),
  },
  {
    slug: "can-i-keep-isp-account-numbers",
    category: "Network",
    question: "Can I keep ISP account numbers?",
    answer: "Yes. Store ISP account identifiers and modem notes in your network documentation so support calls go faster when the internet drops.",
    related: related("networkDocs", "networkGuide", "routerPasswordsGuide", "digitalVault"),
  },
  {
    slug: "should-passwords-live-in-the-vault",
    category: "Security",
    question: "Should passwords live in the vault?",
    answer: "Prefer a password manager for secrets. Use Home Tech Vault for non-secret context—account emails, SSID names, device nicknames, and where the secret is stored.",
    related: related("privateRecords", "wifiGuide", "routerPasswordsGuide", "trust"),
  },
  {
    slug: "can-i-prepare-records-for-insurance",
    category: "Security",
    question: "Can I prepare records for insurance?",
    answer: "Yes. Pair device lists with photos, serials, values, and receipts so you can assemble a claim packet without starting from memory.",
    related: related("insuranceDocs", "serials", "proofOfPurchase", "deviceInventory"),
  },
  {
    slug: "can-i-track-extended-warranties",
    category: "Warranties",
    question: "Can I track extended warranties?",
    answer: "Yes. Record extended-plan numbers and end dates alongside manufacturer coverage so you know which policy to call first.",
    related: related("warrantyTracker", "warrantyHabits", "bestWarranty", "proofOfPurchase"),
  },
  {
    slug: "can-i-set-warranty-reminders",
    category: "Warranties",
    question: "Can I set warranty reminders?",
    answer: "Yes. Coverage dates on device records support timely revisit before expensive protection expires. Prioritize high-value devices to avoid reminder noise.",
    related: related("warrantyTracker", "warrantyHabits", "bestWarranty", "pricing"),
  },
  {
    slug: "can-i-track-gifted-device-warranties",
    category: "Warranties",
    question: "Can I track warranties for gifted devices?",
    answer: "Yes. Capture whatever proof you have—gift receipts, approximate purchase dates, and serials—even when you were not the original buyer.",
    related: related("proofOfPurchase", "warrantyHabits", "unbox", "warrantyTracker"),
  },
  {
    slug: "can-i-file-claims-faster",
    category: "Warranties",
    question: "Can Home Tech Vault help me file warranty claims faster?",
    answer: "It helps by keeping serials, proof of purchase, and coverage notes on one device record so you are not reconstructing a packet under stress.",
    related: related("warrantyTracker", "proofOfPurchase", "serials", "bestWarranty"),
  },
  {
    slug: "can-i-store-purchase-dates",
    category: "Devices",
    question: "Can I store purchase dates?",
    answer: "Yes. Purchase dates anchor warranties, depreciation notes, and replacement planning. Add them when you unbox or when you find the original order email.",
    related: related("unbox", "warrantyHabits", "deviceInventory", "proofOfPurchase"),
  },
  {
    slug: "can-i-track-maintenance",
    category: "Maintenance",
    question: "Can I track maintenance?",
    answer: "Yes. Keep maintenance notes and schedules alongside devices—filters, firmware checkups, battery replacements, and service history.",
    related: related("maintenance", "features", "deviceInventory", "digitalVault"),
  },
  {
    slug: "can-i-log-battery-replacements",
    category: "Maintenance",
    question: "Can I log battery replacements?",
    answer: "Yes. Add short notes on sensors, remotes, and detectors with the last replacement date so you are not waiting for a 2 a.m. chirp.",
    related: related("maintenance", "smartHomeKnowledge", "features", "deviceInventory"),
  },
  {
    slug: "can-i-track-firmware-updates",
    category: "Maintenance",
    question: "Can I track firmware updates?",
    answer: "Yes. Note when routers, cameras, hubs, or appliances were last checked so seasonal maintenance has a clear checklist.",
    related: related("maintenance", "networkGuide", "smartHomeKnowledge", "features"),
  },
  {
    slug: "does-it-replace-vendor-apps",
    category: "Smart Home",
    question: "Does Home Tech Vault replace smart home vendor apps?",
    answer: "No. Vendor apps still control devices. Home Tech Vault is the household inventory and document layer above those apps.",
    related: related("smartHome", "smartHomeKnowledge", "smartHomeGuide", "features"),
  },
  {
    slug: "can-i-inventory-hubs-and-bridges",
    category: "Smart Home",
    question: "Can I inventory hubs and bridges?",
    answer: "Yes. Document hubs and bridges first—they are the brains your endpoints depend on—then attach rooms, accounts, and backup notes.",
    related: related("smartHomeKnowledge", "smartHomeGuide", "smartHome", "networkGuide"),
  },
  {
    slug: "can-i-track-cameras-and-sensors",
    category: "Smart Home",
    question: "Can I track cameras and sensors?",
    answer: "Yes. Record locations, account ownership, and battery or storage notes so quiet failures in closets and attics are less surprising.",
    related: related("smartHomeKnowledge", "smartHome", "insuranceDocs", "maintenance"),
  },
  {
    slug: "can-i-document-thermostats",
    category: "Smart Home",
    question: "Can I document smart thermostats?",
    answer: "Yes. Store model, serial, installer notes, and account email so service calls and seasonal changes are easier.",
    related: related("smartHomeKnowledge", "maintenance", "deviceInventory", "documentOrganizer"),
  },
  {
    slug: "is-my-data-sold",
    category: "Security",
    question: "Is my data sold?",
    answer: "No. Home Tech Vault does not sell your vault data. See the Trust Center and Privacy Policy for how information is handled.",
    related: related("trust", "privateRecords", "features", "pricing"),
  },
  {
    slug: "is-data-encrypted",
    category: "Security",
    question: "Is my data encrypted?",
    answer: "Data is encrypted in transit. Access is protected with secure authentication and household scoping. Review the Trust Center for details.",
    related: related("trust", "privateRecords", "features", "signup"),
  },
  {
    slug: "can-house-sitters-get-access",
    category: "Family",
    question: "Can house sitters get access?",
    answer: "On Family plans you can share limited access appropriate to the situation. Prefer viewer-style visibility and guest Wi-Fi notes over full admin rights.",
    related: related("familySharing", "wifiGuide", "privateRecords", "pricing"),
  },
  {
    slug: "can-multiple-people-edit",
    category: "Family",
    question: "Can multiple people edit the inventory?",
    answer: "Yes on Family with member or admin roles. Viewers remain read-only. That keeps one living inventory instead of conflicting spreadsheet copies.",
    related: related("familySharing", "pricing", "vsSheets", "deviceInventory"),
  },
  {
    slug: "what-happens-when-someone-leaves",
    category: "Family",
    question: "What happens when a household member leaves?",
    answer: "Remove their membership so they no longer access the vault. Rotate shared network secrets in your password manager if they had admin credentials.",
    related: related("familySharing", "privateRecords", "routerPasswordsGuide", "trust"),
  },
  {
    slug: "can-i-use-it-for-renters-insurance",
    category: "Security",
    question: "Can I use it for renters or homeowners insurance?",
    answer: "Yes as supporting documentation—photos, serials, values, and receipts help claims. Policies still vary; inventory does not replace reading your coverage.",
    related: related("insuranceDocs", "deviceInventory", "proofOfPurchase", "serials"),
  },
  {
    slug: "can-i-export-or-share-a-list",
    category: "Inventory",
    question: "Can I share an inventory list with someone?",
    answer: "Family sharing covers ongoing household access. For one-off needs, use shared membership with the right role rather than emailing stale files.",
    related: related("familySharing", "deviceInventory", "digitalVault", "vsSheets"),
  },
  {
    slug: "can-i-migrate-from-a-spreadsheet",
    category: "Inventory",
    question: "Can I migrate from a spreadsheet?",
    answer: "Yes. Use your sheet as a checklist while creating device records—start with high-value items, then attach receipts and serials.",
    related: related("vsSheets", "inventoryGuide", "deviceInventory", "bestInventory"),
  },
  {
    slug: "can-i-migrate-from-notion",
    category: "Inventory",
    question: "Can I migrate from Notion?",
    answer: "Yes. Export or copy key fields into Home Tech Vault device records. You do not need to move every Notion page—focus on devices, warranties, and proof.",
    related: related("vsNotion", "inventoryGuide", "bestInventory", "deviceInventory"),
  },
  {
    slug: "is-home-tech-vault-only-for-electronics",
    category: "Inventory",
    question: "Is Home Tech Vault only for electronics?",
    answer: "It is designed around home technology workflows—devices, warranties, manuals, and network notes. You can still document other high-value items when useful.",
    related: related("homeInventory", "deviceInventory", "bestInventory", "features"),
  },
  {
    slug: "can-i-track-appliances",
    category: "Devices",
    question: "Can I track appliances?",
    answer: "Yes. Washers, HVAC gear, garage openers, and similar appliances belong in the inventory with model, serial, and service notes.",
    related: related("inventoryGuide", "maintenance", "warrantyTracker", "deviceInventory"),
  },
  {
    slug: "can-i-track-laptops-and-phones",
    category: "Devices",
    question: "Can I track laptops and phones?",
    answer: "Yes. Record owner, serial or IMEI, purchase details, and related documents across family members without turning the house into an IT ticket queue.",
    related: related("inventoryGuide", "serials", "familySharing", "deviceInventory"),
  },
  {
    slug: "can-i-track-tvs",
    category: "Devices",
    question: "Can I track TVs?",
    answer: "Yes. Store model, serial, room, account email, and warranty details—especially useful for mounts, soundbars, and claim packets.",
    related: related("deviceInventory", "warrantyTracker", "bestWarranty", "inventoryGuide"),
  },
  {
    slug: "can-i-track-gaming-consoles",
    category: "Devices",
    question: "Can I track gaming consoles?",
    answer: "Yes. Document console serials, account ownership notes, and accessories like controllers so warranty swaps and household sharing stay clear.",
    related: related("deviceInventory", "serials", "familySharing", "inventoryGuide"),
  },
  {
    slug: "can-i-track-printers",
    category: "Devices",
    question: "Can I track printers?",
    answer: "Yes. Keep model, serial, network notes, and supply types on the printer record so toner orders and setup after a Wi-Fi change are simpler.",
    related: related("deviceInventory", "networkDocs", "documentOrganizer", "inventoryGuide"),
  },
  {
    slug: "can-i-organize-cables-and-accessories",
    category: "Devices",
    question: "Can I organize cables and accessories?",
    answer: "High-value or easy-to-confuse accessories can be noted on the parent device. Proprietary chargers and docks are worth documenting; trivial cables usually are not.",
    related: related("inventoryGuide", "deviceInventory", "unbox", "features"),
  },
  {
    slug: "can-i-retire-old-devices",
    category: "Devices",
    question: "Can I retire old devices?",
    answer: "Yes. Mark or remove devices that leave the house so insurance totals and household lists stay honest. Keep historical notes when a warranty replacement changes a serial.",
    related: related("inventoryGuide", "warrantyHabits", "insuranceDocs", "deviceInventory"),
  },
  {
    slug: "does-it-work-on-mobile",
    category: "Accounts",
    question: "Does Home Tech Vault work on mobile?",
    answer: "Yes. Use it from a phone browser to look up serials, upload receipt photos, and check records while you are standing at a device.",
    related: related("features", "demo", "signup", "deviceInventory"),
  },
  {
    slug: "can-i-upload-from-my-phone",
    category: "Documents",
    question: "Can I upload documents from my phone?",
    answer: "Yes. Capture receipt or serial-label photos on your phone and attach them to the device while you still have packaging nearby.",
    related: related("documentOrganizer", "unbox", "proofOfPurchase", "serials"),
  },
  {
    slug: "how-is-this-different-from-google-sheets",
    category: "Inventory",
    question: "How is this different from Google Sheets?",
    answer: "Sheets are excellent grids. Home Tech Vault is device-centric—documents and warranties stay attached to records, with household roles instead of spreadsheet ACLs.",
    related: related("vsSheets", "bestInventory", "deviceInventory", "documentOrganizer"),
  },
  {
    slug: "how-is-this-different-from-notion",
    category: "Inventory",
    question: "How is this different from Notion?",
    answer: "Notion is a flexible workspace you design. Home Tech Vault is opinionated for home tech inventory so you are not maintaining a custom database schema.",
    related: related("vsNotion", "bestInventory", "features", "homeInventory"),
  },
  {
    slug: "how-is-this-different-from-airtable",
    category: "Inventory",
    question: "How is this different from Airtable?",
    answer: "Airtable is a database platform. Home Tech Vault is a finished inventory product—less base-building, more household defaults for devices and proof.",
    related: related("bestInventory", "vsNotion", "features", "homeInventory"),
  },
  {
    slug: "can-i-keep-paper-and-digital-records",
    category: "Documents",
    question: "Can I keep paper and digital records together?",
    answer: "Yes. Digitize what you need for search and remote access, and keep physical originals when you prefer or when legally useful.",
    related: related("documentOrganizer", "digitalVault", "proofOfPurchase", "insuranceDocs"),
  },
  {
    slug: "can-i-store-order-emails",
    category: "Documents",
    question: "Can I store order confirmation emails?",
    answer: "Save PDFs or screenshots of order emails onto the device record. That survives inbox cleanup and still supports claims and returns.",
    related: related("proofOfPurchase", "documentOrganizer", "unbox", "warrantyTracker"),
  },
  {
    slug: "what-is-a-digital-home-vault",
    category: "Inventory",
    question: "What is a digital home vault?",
    answer: "A digital home vault is a living system of household records—devices, documents, and related details—kept where the family can find them, not scattered across apps and drawers.",
    related: related("digitalVault", "homeInventory", "bestInventory", "features"),
  },
  {
    slug: "can-i-use-it-for-moving",
    category: "Inventory",
    question: "Can I use Home Tech Vault when moving?",
    answer: "Yes. Room assignments, device lists, and network notes make pack-out and setup in a new place less chaotic. Update rooms after you settle.",
    related: related("inventoryGuide", "networkGuide", "deviceInventory", "digitalVault"),
  },
  {
    slug: "can-i-use-it-before-travel",
    category: "Security",
    question: "Can I use it before travel?",
    answer: "Yes. Make sure device lists, network notes, and emergency contacts are current before a house sitter or family member watches the home.",
    related: related("familySharing", "networkGuide", "smartHome", "privateRecords"),
  },
  {
    slug: "can-i-document-security-cameras",
    category: "Smart Home",
    question: "Can I document security cameras?",
    answer: "Yes. Record camera locations, account ownership, and monitoring notes so the household can manage access without tribal knowledge.",
    related: related("smartHomeKnowledge", "smartHome", "familySharing", "insuranceDocs"),
  },
  {
    slug: "can-i-document-mesh-wifi",
    category: "Network",
    question: "Can I document mesh Wi-Fi systems?",
    answer: "Yes. Inventory primary units and satellites with room labels and identifiers so replacements do not require rediscovering the whole map.",
    related: related("networkGuide", "routerPasswordsGuide", "networkDocs", "wifiGuide"),
  },
  {
    slug: "can-guests-see-my-vault",
    category: "Family",
    question: "Can guests see my vault?",
    answer: "Only people you invite into the household. Prefer guest Wi-Fi sharing for visitors rather than vault access, unless a sitter truly needs records.",
    related: related("familySharing", "wifiGuide", "privateRecords", "trust"),
  },
  {
    slug: "can-kids-have-accounts",
    category: "Family",
    question: "Can kids have accounts?",
    answer: "Household sharing is designed for family members you trust with inventory visibility. Use viewer roles for limited access and keep billing with an adult.",
    related: related("familySharing", "pricing", "privateRecords", "features"),
  },
  {
    slug: "does-free-include-document-uploads",
    category: "Billing",
    question: "Does Free include document uploads?",
    answer: "Yes within Free plan document limits (25 documents). Pro and Family increase capacity for growing archives of receipts and manuals.",
    related: related("pricing", "documentOrganizer", "features", "signup"),
  },
  {
    slug: "do-i-need-a-credit-card-for-free",
    category: "Billing",
    question: "Do I need a credit card for the Free plan?",
    answer: "No. You can start Free without a credit card and upgrade later if you need unlimited inventory or family sharing.",
    related: related("pricing", "signup", "features", "demo"),
  },
  {
    slug: "where-is-billing-managed",
    category: "Billing",
    question: "Where is billing managed?",
    answer: "Paid plans are managed from account billing settings, including upgrades and cancellations according to your subscription provider flow.",
    related: related("pricing", "features", "trust", "signup"),
  },
  {
    slug: "can-i-track-apple-devices",
    category: "Devices",
    question: "Can I track Apple devices?",
    answer: "Yes. Inventory iPhones, Macs, iPads, and accessories with serials, AppleCare notes, and account context. Brand guides cover Apple-specific habits.",
    related: related("deviceInventory", "serials", "inventoryGuide", "features"),
  },
  {
    slug: "can-i-track-samsung-tvs",
    category: "Devices",
    question: "Can I track Samsung TVs?",
    answer: "Yes. Store model, serial, SmartThings or account notes, and warranty details on the TV record.",
    related: related("deviceInventory", "warrantyTracker", "smartHome", "inventoryGuide"),
  },
  {
    slug: "can-i-organize-google-nest-devices",
    category: "Smart Home",
    question: "Can I organize Google Nest devices?",
    answer: "Yes. Document Nest hubs, cams, thermostats, and speakers with rooms and the Google account that owns the Home.",
    related: related("smartHome", "smartHomeGuide", "smartHomeKnowledge", "deviceInventory"),
  },
  {
    slug: "can-i-organize-ring-devices",
    category: "Smart Home",
    question: "Can I organize Ring devices?",
    answer: "Yes. Keep doorbell and camera locations, account ownership, and monitoring notes in your household inventory.",
    related: related("smartHome", "smartHomeKnowledge", "familySharing", "insuranceDocs"),
  },
  {
    slug: "can-i-document-ubiquiti-gear",
    category: "Network",
    question: "Can I document Ubiquiti gear?",
    answer: "Yes. Inventory consoles, access points, and cameras with names and locations. Keep admin secrets in a password manager.",
    related: related("networkDocs", "networkGuide", "routerPasswordsGuide", "features"),
  },
  {
    slug: "can-i-track-sonos-speakers",
    category: "Smart Home",
    question: "Can I track Sonos speakers?",
    answer: "Yes. Record room names, models, serials, and account ownership so rearranging rooms or transfers is less painful.",
    related: related("smartHome", "smartHomeKnowledge", "deviceInventory", "serials"),
  },
  {
    slug: "how-do-i-contact-support",
    category: "Accounts",
    question: "How do I contact support?",
    answer: "Use the Contact page for questions about your account or the product. The FAQ and Knowledge Center cover common how-to topics.",
    related: related("features", "pricing", "demo", "trust"),
  },
  {
    slug: "can-i-store-mac-addresses",
    category: "Network",
    question: "Can I store MAC addresses?",
    answer: "Yes when useful for ISP support or device identification. Add them as notes on network or device records alongside model details.",
    related: related("networkDocs", "networkGuide", "deviceInventory", "serials"),
  },
  {
    slug: "can-i-track-purchase-price",
    category: "Inventory",
    question: "Can I track purchase price?",
    answer: "Yes. Store what you paid when known to support insurance estimates and replacement decisions. Approximate values are fine when exact receipts are gone.",
    related: related("insuranceDocs", "deviceInventory", "proofOfPurchase", "bestInventory"),
  },
  {
    slug: "can-i-track-replacement-cost",
    category: "Inventory",
    question: "Can I track replacement cost?",
    answer: "Yes. Note rough replacement values on high-value devices and refresh them after major upgrades or market changes.",
    related: related("insuranceDocs", "deviceInventory", "bestInventory", "features"),
  },
  {
    slug: "can-multiple-homes-be-managed",
    category: "Family",
    question: "Can I manage more than one home?",
    answer: "Home Tech Vault is centered on household inventory. If you manage multiple properties, keep room naming clear and document which physical address each set of devices belongs to.",
    related: related("familySharing", "inventoryGuide", "smartHomeKnowledge", "deviceInventory"),
  },
  {
    slug: "can-i-use-demo-mode",
    category: "Accounts",
    question: "What is the interactive demo?",
    answer: "The demo opens a sample vault so you can click around without saving personal data. It is the fastest way to see devices, documents, and structure before signup.",
    related: related("demo", "features", "signup", "homeInventory"),
  },
  {
    slug: "will-my-data-sync",
    category: "Accounts",
    question: "Does my vault sync to the cloud?",
    answer: "Yes. Your household inventory syncs so you can access records from the browsers you use to sign in, subject to authentication and plan access.",
    related: related("trust", "features", "signup", "digitalVault"),
  },
  {
    slug: "what-if-i-forget-my-password",
    category: "Accounts",
    question: "What if I forget my password?",
    answer: "Use the account password reset flow from the login screens. After recovering access, review household membership and any shared network secrets if you suspect compromise.",
    related: related("trust", "privateRecords", "signup", "features"),
  },
  {
    slug: "can-i-add-custom-notes",
    category: "Devices",
    question: "Can I add custom notes to devices?",
    answer: "Yes. Use notes for setup quirks, mount details, account emails, and anything the next person will need under stress.",
    related: related("deviceInventory", "inventoryGuide", "features", "digitalVault"),
  },
  {
    slug: "can-i-link-documents-to-one-device",
    category: "Documents",
    question: "Can I link multiple documents to one device?",
    answer: "Yes. A single device can hold receipts, manuals, photos, and plan documents together so proof stays contextual.",
    related: related("documentOrganizer", "proofOfPurchase", "warrantyTracker", "digitalVault"),
  },
  {
    slug: "can-i-track-return-windows",
    category: "Warranties",
    question: "Can I track return windows?",
    answer: "Yes. Note short retail return windows separately from longer manufacturer warranties, especially right after purchase.",
    related: related("warrantyHabits", "proofOfPurchase", "unbox", "warrantyTracker"),
  },
  {
    slug: "can-i-track-credit-card-purchase-protection",
    category: "Warranties",
    question: "Can I track credit card purchase protection?",
    answer: "Yes. Add card-benefit notes as an extra coverage layer so you know whether to call the retailer, manufacturer, or card issuer first.",
    related: related("warrantyHabits", "bestWarranty", "proofOfPurchase", "warrantyTracker"),
  },
  {
    slug: "does-it-help-with-support-calls",
    category: "Devices",
    question: "Does it help with manufacturer support calls?",
    answer: "Yes. Having model, serial, purchase proof, and account email in one place shortens the “let me find that” portion of support calls.",
    related: related("serials", "proofOfPurchase", "deviceInventory", "warrantyTracker"),
  },
  {
    slug: "can-i-document-ethernet-ports",
    category: "Network",
    question: "Can I document Ethernet ports and wired devices?",
    answer: "Yes. Note wall jacks, switch ports, and hardwired gear so moves and troubleshooting are less like cable archaeology.",
    related: related("networkGuide", "networkDocs", "deviceInventory", "features"),
  },
  {
    slug: "can-i-share-wifi-with-family-safely",
    category: "Network",
    question: "Can I share Wi-Fi details with family safely?",
    answer: "Share SSID context in the vault and passphrases through a password manager or platform sharing—not permanent group texts.",
    related: related("wifiGuide", "routerPasswordsGuide", "familySharing", "privateRecords"),
  },
  {
    slug: "is-home-tech-vault-a-password-manager",
    category: "Security",
    question: "Is Home Tech Vault a password manager?",
    answer: "No. It is a household tech inventory and document vault. Use a dedicated password manager for secrets and keep non-secret context in HTV.",
    related: related("privateRecords", "trust", "wifiGuide", "features"),
  },
  {
    slug: "can-i-use-it-offline",
    category: "Accounts",
    question: "Can I use Home Tech Vault fully offline?",
    answer: "Home Tech Vault is a cloud-connected web product. You need connectivity to sign in and sync. For outages, keep critical network notes accessible via your usual offline contingency.",
    related: related("networkGuide", "features", "trust", "demo"),
  },
  {
    slug: "how-do-i-get-started-quickly",
    category: "Accounts",
    question: "How do I get started quickly?",
    answer: "Create a free account, add five high-value devices, attach one receipt or serial photo each, and invite a partner if you are on Family. Momentum beats a perfect weekend project.",
    related: related("signup", "inventoryGuide", "unbox", "demo"),
  },
  {
    slug: "can-i-track-subscriptions-tied-to-devices",
    category: "Devices",
    question: "Can I note subscriptions tied to devices?",
    answer: "Yes. Add notes for monitoring plans, ink subscriptions, or cloud camera plans on the relevant device so renewals are visible next to the hardware.",
    related: related("warrantyHabits", "smartHomeKnowledge", "deviceInventory", "pricing"),
  },
  {
    slug: "does-pricing-include-tax",
    category: "Billing",
    question: "Does displayed pricing include tax?",
    answer: "Listed plan prices are the subscription amounts shown on the pricing page. Applicable taxes depend on your billing details and provider checkout.",
    related: related("pricing", "features", "signup", "trust"),
  },
  {
    slug: "can-i-change-household-owner",
    category: "Family",
    question: "Can the household owner change?",
    answer: "Ownership and billing are tied to the account that manages the household subscription. Contact support if you need help with ownership transfers after major household changes.",
    related: related("familySharing", "pricing", "trust", "features"),
  },
  {
    slug: "where-can-i-learn-more",
    category: "Accounts",
    question: "Where can I learn more beyond this FAQ?",
    answer: "Browse the Knowledge Center for long-form guides, Brand Guides for device-maker tips, and Compare pages for tool tradeoffs. The Features and Demo pages show the product directly.",
    related: related("features", "demo", "bestInventory", "inventoryGuide"),
  }
];

export function getAllSeoFaqs(): SeoFaqEntry[] {
  return SEO_FAQ_ENTRIES;
}

export function getSeoFaq(slug: string): SeoFaqEntry | null {
  return (
    SEO_FAQ_ENTRIES.find((entry) => entry.slug === slug) ?? null
  );
}

export function getSeoFaqsByCategory(
  category: SeoFaqCategory
): SeoFaqEntry[] {
  return SEO_FAQ_ENTRIES.filter(
    (entry) => entry.category === category
  );
}

export function listSeoFaqStaticParams() {
  return SEO_FAQ_ENTRIES.map((entry) => ({
    slug: entry.slug,
  }));
}

export function seoFaqPath(slug: string) {
  return `/faq/${slug}`;
}

export function seoFaqSitemapEntries(siteUrl: string) {
  return SEO_FAQ_ENTRIES.map((entry) => ({
    url: `${siteUrl}${seoFaqPath(entry.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));
}

export const SEO_FAQ_CATEGORIES: SeoFaqCategory[] = [
  "Accounts",
  "Devices",
  "Documents",
  "Network",
  "Smart Home",
  "Warranties",
  "Maintenance",
  "Family",
  "Security",
  "Billing",
  "Inventory",
];
