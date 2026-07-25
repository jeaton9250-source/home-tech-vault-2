import type { SeoBrand } from "@/lib/seo/programmatic/brands";
import {
  brandMatchesIntent,
  GUIDE_INTENTS,
  primaryProductForIntent,
  type GuideIntent,
  type GuideIntentId,
} from "@/lib/seo/programmatic/intents";
import { SEO_BRANDS } from "@/lib/seo/programmatic/brands";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export type ProgrammaticFaq = {
  question: string;
  answer: string;
};

export type ProgrammaticSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type ProgrammaticRelatedLink = {
  href: string;
  title: string;
  description: string;
};

export type ProgrammaticGuidePage = {
  slug: string;
  path: string;
  brandSlug: string | null;
  brandName: string | null;
  intentId: GuideIntentId | "topic";
  group: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  intro: string[];
  sections: ProgrammaticSection[];
  faq: ProgrammaticFaq[];
  relatedSlugs: string[];
  ctaTitle: string;
  ctaDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickProductNoun(product: string): string {
  if (/tv/i.test(product)) {
    return "TV";
  }
  if (/router|orbi|deco|dream|mesh|nighthawk/i.test(product)) {
    return "router";
  }
  if (/printer|pixma|ecotank|laser/i.test(product)) {
    return "printer";
  }
  if (/xbox|playstation|ps5/i.test(product)) {
    return "console";
  }
  return product;
}

function brandOrganizeSlug(brand: SeoBrand): string {
  return `how-to-organize-your-${brand.slug}-devices`;
}

function brandProductSlug(brand: SeoBrand, product: string): string {
  const noun = pickProductNoun(product);
  return `how-to-organize-your-${brand.slug}-${slugify(noun)}`;
}

function brandWarrantySlug(brand: SeoBrand): string {
  return `how-to-track-${brand.slug}-warranties`;
}

function brandRouterPasswordSlug(brand: SeoBrand): string {
  return `how-to-store-${brand.slug}-router-passwords`;
}

function brandSmartHomeSlug(brand: SeoBrand): string {
  return `how-to-organize-${brand.slug}-smart-home-devices`;
}

function brandSerialsSlug(brand: SeoBrand): string {
  return `how-to-document-${brand.slug}-serial-numbers`;
}

function brandInsuranceSlug(brand: SeoBrand): string {
  return `how-to-prepare-${brand.slug}-devices-for-insurance`;
}

function truncateMeta(value: string, max = 158): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function composeOrganizeDevices(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandOrganizeSlug(brand);
  const title = `How to Organize Your ${brand.name} Devices`;
  const fields = brand.recordFields.map((field) => `• ${field}`).join("\n");

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "organize-devices",
    group: "Organization",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Build a clear household inventory for ${brand.possessiveLabel}. Capture ${brand.ecosystem} details, serials, rooms, and warranties in one place.`
    ),
    keywords: [
      `organize ${brand.name} devices`,
      `${brand.name} device inventory`,
      `${brand.name} home tech list`,
      brand.ecosystem,
    ],
    heroEyebrow: `${brand.name} organization`,
    heroTitle: title,
    heroDescription: `A practical system for listing ${brand.possessiveLabel} across rooms, accounts, and family members — without another spreadsheet that dies in a week.`,
    intro: [
      `${brand.name} gear tends to multiply quietly. A household that starts with one ${brand.products[0]} often ends up with ${brand.products.slice(0, 3).join(", ")}, plus accessories nobody wants to claim.`,
      `${brand.facts[0]} That is why a brand-level inventory beats relying on memory or the default ${brand.ecosystem} screens alone.`,
      `This guide walks through what to capture for ${brand.possessiveLabel}, how to keep rooms and owners straight, and how Home Tech Vault turns those notes into a living record.`,
    ],
    sections: [
      {
        id: "why-brand-inventory",
        heading: `Why ${brand.name} needs its own inventory lane`,
        paragraphs: [
          `Mixed-brand lists are fine for a dashboard, but ${brand.name} support, warranties, and account recovery still ask brand-specific questions. Keeping a filtered view of ${brand.possessiveLabel} shortens those moments.`,
          brand.facts[1],
          `Start with devices you can touch this week. Skip perfection. A partial ${brand.name} list that is accurate beats a complete fantasy spreadsheet.`,
        ],
      },
      {
        id: "what-to-capture",
        heading: "What to capture on every device",
        paragraphs: [
          `For ${brand.possessiveLabel}, prioritize fields that unlock support and claims:`,
          fields,
          `Add room, primary user, and purchase date when you know them. Leave blanks rather than guessing — wrong serials create worse support calls than missing ones.`,
        ],
      },
      {
        id: "accounts-and-ecosystem",
        heading: `Map the ${brand.ecosystem} footprint`,
        paragraphs: [
          `Write down which household email owns which device in ${brand.ecosystem}. ${brand.friction[0]}`,
          `If Family Sharing, Household, or shared-home features exist, note who is an owner versus a participant. That distinction matters when someone moves out or a phone is wiped.`,
          `Do not paste raw passwords into a shared inventory. Point to your password manager, and store non-secret context (account email, device nickname, recovery contact) beside the device record.`,
        ],
      },
      {
        id: "rooms-and-ownership",
        heading: "Rooms, owners, and shared gear",
        paragraphs: [
          `Assign each ${brand.name} device a room even if it travels. Traveling laptops can live under “Work bag” or a person’s name — consistency matters more than furniture accuracy.`,
          brand.friction[1],
          `For shared living-room gear, pick one household owner for documentation purposes. That person is not the only user — they are the contact when warranties or replacements come up.`,
        ],
      },
      {
        id: "photos-and-proof",
        heading: "Photos and proof of purchase",
        paragraphs: [
          `Photograph serial labels, boxes if you still have them, and the device in its usual spot. Insurance and support both move faster with visuals.`,
          `Attach receipts or order emails to the device record while they are still searchable. ${brand.facts[2]}`,
          `If a device was a gift, note the giver and approximate date. Incomplete proof is still better than a blank history.`,
        ],
      },
      {
        id: "accessories",
        heading: "Accessories that deserve a line item",
        paragraphs: [
          `Chargers, docks, remotes, and cases become orphaned fast. Add high-value or easy-to-confuse accessories as linked notes on the parent ${brand.name} device.`,
          `When two family members own the same headphone model, label ownership in the inventory or you will solve the wrong warranty later.`,
          `Cables can stay generic unless they are proprietary and scarce — then a short note saves a reorder.`,
        ],
      },
      {
        id: "maintenance-hooks",
        heading: "Hook inventory to maintenance",
        paragraphs: [
          `Once ${brand.possessiveLabel} are listed, attach lightweight reminders: filter cleans, battery swaps, firmware check months, or AppleCare-style renewal windows.`,
          brand.friction[2],
          `You do not need a corporate CMDB. You need dates and notes a tired human can follow on a Saturday morning.`,
        ],
      },
      {
        id: "family-handoff",
        heading: "Make the list usable for someone else",
        paragraphs: [
          `Share a read-only view with a partner or house sitter for emergencies. They should be able to identify the living-room ${brand.products[0]} and find account ownership without hunting through texts.`,
          `Review the ${brand.name} list after holidays and back-to-school — those are when devices arrive undocumented.`,
          `Retire records when devices leave the house. A graveyard of sold phones creates false insurance totals.`,
        ],
      },
      {
        id: "put-it-in-htv",
        heading: "Put it to work in Home Tech Vault",
        paragraphs: [
          `Home Tech Vault is built for this exact household problem: devices, documents, and warranties in one place, with optional family sharing.`,
          `Create ${brand.name} device entries, attach receipts, and keep room/owner fields current. Related guides below cover warranties, serials, and smart-home specifics when those apply.`,
          `Start with five devices today. Momentum beats a heroic weekend project.`,
        ],
      },
    ],
    faq: [
      {
        question: `Do I need a separate list just for ${brand.name}?`,
        answer: `Keep one household inventory, then filter by brand when you need it. Brand-specific guides help you capture the right ${brand.name} fields — they do not require a second system.`,
      },
      {
        question: `What if I do not know the ${brand.ecosystem} email?`,
        answer: `Check the device settings or app that manages it, then write the email on the record. If you cannot sign in, note “unknown owner account” and fix it before the next OS update cycle.`,
      },
      {
        question: "Should passwords live in the inventory?",
        answer:
          "No. Store passwords in a password manager. Keep inventory notes limited to account emails, device nicknames, and where the secret is stored.",
      },
      {
        question: `How detailed should ${brand.name} model names be?`,
        answer: `Prefer the support model or identifier over the marketing nickname. ${brand.recordFields[1]} is usually the field support asks for.`,
      },
      {
        question: "How often should we update the list?",
        answer:
          "Update when something arrives, leaves, or changes rooms. Do a 20-minute sweep each season to catch drift.",
      },
      {
        question: "Can kids help maintain the inventory?",
        answer:
          "Yes for non-sensitive fields like room and nickname. Keep warranty documents and account ownership with an adult.",
      },
    ],
    relatedSlugs: [
      brandWarrantySlug(brand),
      brandSerialsSlug(brand),
      brandInsuranceSlug(brand),
    ],
    ctaTitle: `Organize ${brand.possessiveLabel} in Home Tech Vault`,
    ctaDescription: `Create device records, attach proof, and share a household view so ${brand.name} support moments stay short.`,
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "See features",
    secondaryCtaHref: MARKETING_ROUTES.features,
  };
}

function composeOrganizeProduct(
  brand: SeoBrand,
  intent: GuideIntent
): ProgrammaticGuidePage | null {
  const product = primaryProductForIntent(brand, intent);
  if (!product) {
    return null;
  }

  const noun = pickProductNoun(product);
  const slug = brandProductSlug(brand, product);
  const title = `How to Organize Your ${brand.name} ${noun === "TV" ? "TV" : noun.charAt(0).toUpperCase() + noun.slice(1)}`;
  const isTv = noun === "TV";
  const isRouter = noun === "router";
  const isPrinter = noun === "printer";
  const isConsole = noun === "console";

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "organize-product",
    group: "Organization",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      isTv
        ? `Organize your ${brand.name} TV with model, serial, account, apps, and warranty notes your household can find during setup or a claim.`
        : isRouter
          ? `Document your ${brand.name} router: admin access references, Wi-Fi names, node locations, and ISP details for calmer outages.`
          : isPrinter
            ? `Keep your ${brand.name} printer documented — model, serial, network notes, and supply types — so replacements and setup stay simple.`
            : `Organize your ${brand.name} ${noun} with serials, accounts, and household ownership notes in one place.`
    ),
    keywords: [
      `organize ${brand.name} ${noun}`,
      `${brand.name} ${noun} inventory`,
      `${brand.name} ${noun} documentation`,
    ],
    heroEyebrow: `${brand.name} ${noun}`,
    heroTitle: title,
    heroDescription: `Focus on the ${product} (and siblings like it) so living-room or office setup details stop living only in one person’s head.`,
    intro: [
      `A ${product} looks simple until you need the model for a mount, a claim, or a replacement remote. ${brand.facts[0]}`,
      `This page narrows inventory habits to ${brand.name} ${noun} gear: what to record, what to photograph, and what to share with family.`,
      `Use it alongside your broader ${brand.name} device list — product pages go deeper on the awkward details.`,
    ],
    sections: [
      {
        id: "start-with-identity",
        heading: `Identify the exact ${brand.name} ${noun}`,
        paragraphs: [
          `Write the marketing name and the support model. For ${brand.name}, those are often different strings.`,
          `Capture the serial from the device label or settings screen. ${brand.facts[1]}`,
          isTv
            ? "Photograph the rear input panel and any One Connect / breakout boxes so cable swaps are less mysterious."
            : isRouter
              ? "Note which unit is the primary router versus a mesh satellite or access point."
              : "Photograph the label while the device is still easy to move.",
        ],
      },
      {
        id: "account-layer",
        heading: "Account and app layer",
        paragraphs: [
          `Record which ${brand.ecosystem} login owns this ${noun}. ${brand.friction[0]}`,
          isConsole
            ? "Note Home Xbox / primary console style settings if they affect sharing."
            : isTv || isRouter
              ? "List profiles, PINs, or admin users at a high level — not the secrets themselves."
              : "Note mobile apps used for setup and which phone still has them installed.",
          "If a former roommate’s email still owns the device, schedule a transfer before the next outage.",
        ],
      },
      {
        id: "placement",
        heading: "Placement and dependencies",
        paragraphs: [
          isRouter
            ? `Map ${brand.name} node locations and what each roughly covers. ${brand.friction[1]}`
            : isTv
              ? "Note wall-mount vs stand, soundbar pairing, and which streaming apps matter day to day."
              : isPrinter
                ? "Document wired vs Wi-Fi setup, preferred SSID, and any static IP or hostname."
                : "Note the room, power dependencies, and any docking or storage add-ons.",
          brand.facts[2],
          "Dependencies (soundbars, subs, docks, mesh nodes) deserve a linked note so a single failure does not orphan the mental model.",
        ],
      },
      {
        id: "warranty-and-proof",
        heading: "Warranty and proof",
        paragraphs: [
          `Attach purchase proof and warranty end dates to the ${noun} record.`,
          brand.friction[2],
          "If you bought an extended plan, store the plan number beside the device — not in a random email folder name.",
        ],
      },
      {
        id: "household-instructions",
        heading: "Household instructions worth writing",
        paragraphs: [
          isTv
            ? "Write how guests switch inputs, which profile to use, and where the remote batteries live."
            : isRouter
              ? "Write how to find the guest Wi-Fi name and who can approve new admin changes."
              : isPrinter
                ? "Write paper size defaults, duplex norms, and where spare toner/ink lives."
                : "Write who may install games or apps and where controllers / accessories are stored.",
          "Short instructions prevent “just factory reset it” as the first instinct.",
          "Keep instructions next to the device record in Home Tech Vault so they travel with the inventory.",
        ],
      },
      {
        id: "replacement-readiness",
        heading: "Replacement readiness",
        paragraphs: [
          `When this ${noun} dies, you will want model, mount/cable notes, and account ownership in under two minutes.`,
          "A complete record also helps you avoid buying the wrong generation of stick, remote, or toner.",
          `Link related ${brand.name} guides for warranties and serial documentation.`,
        ],
      },
      {
        id: "cadence",
        heading: "A light update cadence",
        paragraphs: [
          "Update after firmware resets, room changes, or new accessories.",
          "Revisit streaming pins, printer networks, and mesh names when you change primary Wi-Fi.",
          "Archive the record when the device is sold or recycled.",
        ],
      },
      {
        id: "htv",
        heading: "Track it in Home Tech Vault",
        paragraphs: [
          `Create a device entry for your ${product}, attach photos and receipts, and keep room notes current.`,
          "Share viewer access with family members who need setup context without full edit rights.",
          "Use related pages below for warranties, passwords, or broader brand organization.",
        ],
      },
    ],
    faq: [
      {
        question: `Is a ${brand.name} ${noun} worth its own inventory entry?`,
        answer: `Yes if it has a serial, account, warranty, or replacement cost. Living-room and office ${noun}s almost always qualify.`,
      },
      {
        question: "What photo should I take first?",
        answer:
          "The serial label, then the device in context (wall, shelf, or closet) so placement is obvious later.",
      },
      {
        question: "Where do Wi-Fi passwords go?",
        answer:
          "In a password manager. Store SSID names and “where the password lives” references on the device or network record.",
      },
      {
        question: `How do I handle multiple ${brand.name} ${noun}s?`,
        answer: `Give each a distinct nickname (Living Room, Basement) and unique serials. Never merge two units into one record.`,
      },
      {
        question: "What about remotes and controllers?",
        answer:
          "Add them as notes or child accessories on the parent device, especially if replacements are model-specific.",
      },
      {
        question: "Can I share this with a house sitter?",
        answer:
          "Share a limited household view with non-secret setup notes. Keep admin credentials in a password manager with separate sharing rules.",
      },
    ],
    relatedSlugs: [
      brandOrganizeSlug(brand),
      brandWarrantySlug(brand),
      isRouter
        ? brandRouterPasswordSlug(brand)
        : isTv
          ? "how-to-track-tv-warranties"
          : brandSerialsSlug(brand),
    ],
    ctaTitle: `Keep your ${brand.name} ${noun} documented`,
    ctaDescription:
      "Home Tech Vault stores the device, documents, and household notes you will need for setup, support, and claims.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Browse all guides",
    secondaryCtaHref: "/guides",
  };
}

function composeTrackWarranties(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandWarrantySlug(brand);
  const title = `How to Track ${brand.name} Warranties`;

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "track-warranties",
    group: "Warranties",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Track ${brand.name} warranty dates, proof of purchase, and coverage types so claims do not depend on a buried email thread.`
    ),
    keywords: [
      `${brand.name} warranty tracker`,
      `track ${brand.name} warranties`,
      `${brand.name} proof of purchase`,
    ],
    heroEyebrow: `${brand.name} warranties`,
    heroTitle: title,
    heroDescription: `Coverage windows for ${brand.possessiveLabel} are easy to miss. Build a habit that captures dates and documents while the unboxing energy is still there.`,
    intro: [
      `Most ${brand.name} warranty pain is not the claim form — it is finding the proof and the end date. ${brand.facts[2]}`,
      `This guide focuses on tracking coverage for ${brand.possessiveLabel}: manufacturer terms, extended plans, and the fields support will ask for.`,
      `Pair each warranty note with the device record so serials and receipts travel together.`,
    ],
    sections: [
      {
        id: "coverage-types",
        heading: "Name the coverage you actually have",
        paragraphs: [
          `Separate manufacturer warranty, retailer return window, extended plan, and credit-card protections for each ${brand.name} device.`,
          `Write the end date for each layer. If you only remember “about two years,” put a revisit reminder instead of a fake date.`,
          brand.friction[2],
        ],
      },
      {
        id: "proof",
        heading: "Proof that survives inbox cleanup",
        paragraphs: [
          "Save PDFs or screenshots of receipts and order confirmations on the device record.",
          `Registration emails for ${brand.ecosystem} portals are useful but incomplete without the receipt.`,
          "For gifts, ask for a gift receipt photo early — before the giver archives the order.",
        ],
      },
      {
        id: "serial-binding",
        heading: "Bind warranty to serials",
        paragraphs: [
          `Claims stall when serials and invoices do not match. Capture ${brand.recordFields.filter((field) => /serial|service|machine|model/i.test(field)).join(", ") || "serial and model"} on day one.`,
          brand.facts[1],
          "If a device is replaced under warranty, update the serial on the same record and note the RMA.",
        ],
      },
      {
        id: "alerts",
        heading: "Alerts without noise",
        paragraphs: [
          "Remind 30–60 days before expensive coverage ends — not for every $20 accessory.",
          `Prioritize ${brand.products.slice(0, 2).join(" and ")} class devices where repair costs hurt.`,
          "When a reminder fires, decide: repair, renew, or retire — then log the decision.",
        ],
      },
      {
        id: "claim-packet",
        heading: "Build a claim packet once",
        paragraphs: [
          "A good packet includes serial, proof of purchase, symptom notes, and account email on file.",
          `Know which portal or phone line ${brand.name} expects before you are on hold.`,
          "Store support case numbers on the device timeline when a claim starts.",
        ],
      },
      {
        id: "household",
        heading: "Household visibility",
        paragraphs: [
          "Partners should be able to see warranty end dates without hunting your email.",
          brand.friction[0],
          "Use shared household access for records, not shared passwords.",
        ],
      },
      {
        id: "htv",
        heading: "Track warranties in Home Tech Vault",
        paragraphs: [
          "Attach documents to devices, set coverage dates, and keep everything filterable by brand.",
          `Start with your highest-value ${brand.name} items this week.`,
          "Related guides cover organization and insurance-ready packets.",
        ],
      },
    ],
    faq: [
      {
        question: `Where do ${brand.name} warranty dates usually live?`,
        answer: `On receipts, packing emails, and sometimes inside ${brand.ecosystem} after registration. Copy the end date into your inventory so you are not dependent on any single portal.`,
      },
      {
        question: "What if I never registered the product?",
        answer:
          "You can often still claim with proof of purchase and serial. Register when possible, and store the proof either way.",
      },
      {
        question: "Do extended plans replace manufacturer coverage?",
        answer:
          "Usually they layer after or beside it. Record both and note which to call first.",
      },
      {
        question: "Should I track return windows too?",
        answer:
          "Yes for the first weeks after purchase. Put a short-dated reminder, then leave the long warranty on the record.",
      },
      {
        question: "How do I handle refurbished units?",
        answer:
          "Note refurbished status, seller warranty length, and any manufacturer remaining coverage separately.",
      },
      {
        question: "Can Home Tech Vault store the PDFs?",
        answer:
          "Yes — attach receipts and plan documents to the device so claims do not depend on email search.",
      },
    ],
    relatedSlugs: [
      brandOrganizeSlug(brand),
      brandSerialsSlug(brand),
      brand.categories.includes("tv") || brand.categories.includes("streaming")
        ? "how-to-track-tv-warranties"
        : brandInsuranceSlug(brand),
    ],
    ctaTitle: `Track ${brand.name} coverage in one place`,
    ctaDescription:
      "Home Tech Vault keeps warranty dates and proof next to each device record.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Warranty tracker overview",
    secondaryCtaHref: "/warranty-tracker",
  };
}

function composeRouterPasswords(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandRouterPasswordSlug(brand);
  const title = `How to Store ${brand.name} Router Passwords`;

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "store-router-passwords",
    group: "Networking",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Store ${brand.name} admin and Wi-Fi credentials safely: password manager for secrets, household notes for SSIDs, nodes, and recovery context.`
    ),
    keywords: [
      `${brand.name} router password`,
      `store ${brand.name} wifi password`,
      `${brand.name} admin credentials`,
    ],
    heroEyebrow: `${brand.name} network access`,
    heroTitle: title,
    heroDescription: `Outages get longer when only one person knows the ${brand.name} admin login. Separate secrets from household context — and write the context down.`,
    intro: [
      `${brand.friction[0]} That pattern turns a five-minute reboot into an evening project.`,
      `For ${brand.possessiveLabel}, store passwords in a password manager, and keep SSID names, node maps, and account emails in your household inventory.`,
      `This guide shows the split that keeps ${brand.name} networks recoverable without pasting secrets into shared docs.`,
    ],
    sections: [
      {
        id: "split-secrets",
        heading: "Split secrets from context",
        paragraphs: [
          "Secrets: admin password, Wi-Fi passphrase, ISP portal password — password manager only.",
          `Context: SSID names, ${brand.recordFields[2]}, which email owns ${brand.ecosystem}, and where the hardware sits.`,
          "Home Tech Vault holds the context and document attachments; your password manager holds the keys.",
        ],
      },
      {
        id: "ssid-notes",
        heading: "SSID and guest network notes",
        paragraphs: [
          `List primary and guest network names for your ${brand.name} system. Guests need names more often than admin access.`,
          brand.facts[0],
          "Note if IoT or kids networks exist and which devices belong there — still without writing passphrases into the inventory.",
        ],
      },
      {
        id: "admin-path",
        heading: "Admin access path",
        paragraphs: [
          `Document how you reach admin: app name, local URL, or cloud ${brand.ecosystem} login.`,
          brand.facts[1],
          "Record who is allowed to change settings. Fewer admins, clearer ownership.",
        ],
      },
      {
        id: "hardware-map",
        heading: "Hardware map",
        paragraphs: [
          `Label primary router vs satellites/APs. ${brand.friction[1]}`,
          "Capture serials/MACs ISP support may request.",
          "Photograph the utility closet once; it saves cable tracing later.",
        ],
      },
      {
        id: "recovery",
        heading: "Recovery without panic",
        paragraphs: [
          "Note whether a factory reset would break ISP bridge mode or VLAN assumptions.",
          brand.facts[2],
          "Keep ISP account numbers in the network record so hold music is shorter.",
        ],
      },
      {
        id: "sharing",
        heading: "Sharing with family",
        paragraphs: [
          brand.friction[2],
          "Share Wi-Fi via password manager groups or platform sharing — not group texts.",
          "Give house sitters guest Wi-Fi and camera context, not full admin.",
        ],
      },
      {
        id: "htv",
        heading: "Network docs in Home Tech Vault",
        paragraphs: [
          `Create network and ${brand.name} device records, attach ISP docs, and link related gear.`,
          "Use the related router organization guide for physical inventory depth.",
          "Start by writing SSID names and admin account emails today.",
        ],
      },
    ],
    faq: [
      {
        question: `Should I put my ${brand.name} admin password in Home Tech Vault?`,
        answer:
          "Prefer a password manager for the password itself. Store non-secret context (SSIDs, account email, node locations) in Home Tech Vault.",
      },
      {
        question: "What is safe to share with family?",
        answer:
          "Guest Wi-Fi details and device nicknames. Limit admin credentials to adults who change network settings.",
      },
      {
        question: "How do I handle mesh satellites?",
        answer:
          "Inventory each node with a room label and serial. Note which unit is primary.",
      },
      {
        question: "What about ISP gateway passwords?",
        answer:
          "Store them in the password manager too, and keep account numbers plus modem identifiers in your network notes.",
      },
      {
        question: "How often should credentials rotate?",
        answer:
          "Rotate when someone with access leaves the household, after a compromise scare, or when a sticky-note password is discovered.",
      },
      {
        question: "Can I document VLANs?",
        answer:
          "Yes at a high level (IoT vs main). Keep advanced configs backed up per your controller’s export tools.",
      },
    ],
    relatedSlugs: [
      brandProductSlug(
        brand,
        brand.products.find((product) =>
          /router|orbi|deco|dream|mesh|nighthawk/i.test(product)
        ) ?? brand.products[0]
      ),
      "how-to-store-router-passwords",
      brandOrganizeSlug(brand),
    ],
    ctaTitle: `Document your ${brand.name} network calmly`,
    ctaDescription:
      "Home Tech Vault keeps network context beside device records so outages are less chaotic.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Network documentation",
    secondaryCtaHref: "/network-documentation",
  };
}

function composeSmartHome(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandSmartHomeSlug(brand);
  const title = `How to Organize ${brand.name} Smart Home Devices`;

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "organize-smart-home",
    group: "Smart Home",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Organize ${brand.possessiveLabel} across rooms and ${brand.ecosystem} so hubs, sensors, and speakers stay understandable for the whole household.`
    ),
    keywords: [
      `organize ${brand.name} smart home`,
      `${brand.name} device inventory`,
      `${brand.ecosystem} household records`,
    ],
    heroEyebrow: `${brand.name} smart home`,
    heroTitle: title,
    heroDescription: `Vendor apps show devices. Households still need an inventory above those apps — rooms, owners, hubs, and backups included.`,
    intro: [
      `${brand.facts[0]}`,
      `Organizing ${brand.possessiveLabel} means documenting hubs first, then endpoints, then automations worth saving.`,
      `This guide stays practical: what to list, what to ignore, and how to share access without oversharing.`,
    ],
    sections: [
      {
        id: "hubs-first",
        heading: "Hubs and accounts first",
        paragraphs: [
          `Identify the controlling app and ${brand.ecosystem} owner email.`,
          brand.facts[1],
          "If there are multiple homes in the app, write which physical address maps to which home name.",
        ],
      },
      {
        id: "room-model",
        heading: "One room model",
        paragraphs: [
          "Pick room names and reuse them in the app and in Home Tech Vault.",
          brand.friction[1],
          "Inconsistent room names break guest instructions and automation mental models.",
        ],
      },
      {
        id: "device-fields",
        heading: "Fields that matter",
        paragraphs: [
          `Capture ${brand.recordFields.slice(0, 4).join(", ")}.`,
          brand.facts[2],
          "Battery devices need install dates or last-replacement notes.",
        ],
      },
      {
        id: "sharing",
        heading: "Sharing without oversharing",
        paragraphs: [
          brand.friction[0],
          "Prefer role-based sharing in the vendor app plus a household inventory viewer role.",
          "House sitters get entry and camera context — not the ability to delete devices.",
        ],
      },
      {
        id: "backups",
        heading: "Manual backups worth keeping",
        paragraphs: [
          "Export or screenshot automations you would hate to rebuild.",
          brand.friction[2],
          "Note where local vs cloud recordings live for cameras.",
        ],
      },
      {
        id: "retire",
        heading: "Retire dead endpoints",
        paragraphs: [
          `Remove ghost ${brand.name} devices from both the app and your inventory.`,
          "Ghost devices inflate insurance lists and confuse troubleshooting.",
          "Schedule a quarterly 15-minute cleanup.",
        ],
      },
      {
        id: "htv",
        heading: "Use Home Tech Vault as the layer above apps",
        paragraphs: [
          "Apps change. Your household record should not depend on a single vendor UI.",
          `Inventory ${brand.possessiveLabel}, attach manuals, and link related networking notes.`,
          "Browse the related smart-home topic guide for brand-agnostic habits.",
        ],
      },
    ],
    faq: [
      {
        question: `Do I still need the ${brand.name} app?`,
        answer:
          "Yes for control. Home Tech Vault is for durable household records, documents, and sharing context — not replacing the vendor app.",
      },
      {
        question: "What should I inventory first?",
        answer:
          "Hubs/bridges, then cameras and locks, then sensors and bulbs.",
      },
      {
        question: "How do I handle shared homes?",
        answer:
          "Document owner vs member emails and remove people who no longer need access.",
      },
      {
        question: "Should automations be inventoried?",
        answer:
          "Only the ones you rely on weekly or that would be painful to rebuild. A short note beats a full programming manual.",
      },
      {
        question: "Where do Wi-Fi credentials go?",
        answer:
          "Password manager for secrets; SSID names can live on network records.",
      },
      {
        question: "Can I track battery replacements?",
        answer:
          "Yes — add a maintenance note on each battery device with the last replacement date.",
      },
    ],
    relatedSlugs: [
      "how-to-organize-smart-home-devices",
      brandOrganizeSlug(brand),
      brandWarrantySlug(brand),
    ],
    ctaTitle: `Organize ${brand.name} smart home gear`,
    ctaDescription:
      "Keep hubs, rooms, and device records in Home Tech Vault above the vendor apps you already use.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Smart home organizer",
    secondaryCtaHref: "/smart-home-organizer",
  };
}

function composeSerials(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandSerialsSlug(brand);
  const title = `How to Document ${brand.name} Serial Numbers`;

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "document-serials",
    group: "Records",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Find and store ${brand.name} serial numbers for support, warranties, and insurance — with photos and device records that survive packaging day.`
    ),
    keywords: [
      `${brand.name} serial number`,
      `document ${brand.name} serial`,
      `${brand.name} service tag`,
    ],
    heroEyebrow: `${brand.name} serials`,
    heroTitle: title,
    heroDescription: `Serials unlock support and claims for ${brand.possessiveLabel}. Capture them once, photograph the label, and keep them beside the device record.`,
    intro: [
      brand.facts[1],
      `Households lose serials when boxes disappear. Build a capture habit for every new ${brand.name} device.`,
      "This guide covers where to look, what to store, and how to avoid mixing similar devices.",
    ],
    sections: [
      {
        id: "where-to-find",
        heading: "Where to find the serial",
        paragraphs: [
          `Check settings screens, underside labels, and ${brand.ecosystem} device info pages.`,
          `Prefer fields like ${brand.recordFields[0]} and serial/service identifiers together.`,
          "If a label is worn, photograph it now and store the image on the record.",
        ],
      },
      {
        id: "capture-habit",
        heading: "Unboxing capture habit",
        paragraphs: [
          "Before recycling the box, shoot the serial and UPC area.",
          brand.friction[1],
          "Enter the serial into Home Tech Vault the same day you power the device on.",
        ],
      },
      {
        id: "avoid-collisions",
        heading: "Avoid collisions",
        paragraphs: [
          `Two ${brand.products[0]} units need distinct nicknames plus serials.`,
          "Never reuse a record when a warranty replacement arrives — update or clone carefully.",
          "Accessories with their own serials (headphones, lenses, controllers) get their own notes.",
        ],
      },
      {
        id: "privacy",
        heading: "Privacy basics",
        paragraphs: [
          "Serials are sensitive enough to keep in a private household vault, not a public photo album.",
          "Share viewer access thoughtfully.",
          "Do not post serial photos to social threads when asking for help.",
        ],
      },
      {
        id: "htv",
        heading: "Store serials in Home Tech Vault",
        paragraphs: [
          `Add ${brand.possessiveLabel} with serial fields and label photos.`,
          "Link warranty documents to the same record.",
          "Use related organization and insurance guides next.",
        ],
      },
    ],
    faq: [
      {
        question: `What if the ${brand.name} serial is unreadable?`,
        answer: `Check the account device list in ${brand.ecosystem}, original packaging photos, or purchase invoices. Support can sometimes locate it with proof of purchase.`,
      },
      {
        question: "Are IMEI and serial the same?",
        answer:
          "Not always. For phones, store both when available and label which is which.",
      },
      {
        question: "Should I inventory factory codes?",
        answer:
          "Only if support asks for them regularly. Serial + model covers most household needs.",
      },
      {
        question: "Can I bulk-import serials?",
        answer:
          "Start with high-value devices manually. Accuracy beats a rushed bulk sheet.",
      },
      {
        question: "What about wiped devices?",
        answer:
          "Keep the historical record with status “retired” so insurance and tax notes stay honest.",
      },
      {
        question: "Do monitors and docks need serials?",
        answer:
          "Yes when they have separate warranties or are easy to mix up across rooms.",
      },
    ],
    relatedSlugs: [
      brandOrganizeSlug(brand),
      brandWarrantySlug(brand),
      brandInsuranceSlug(brand),
    ],
    ctaTitle: `Keep ${brand.name} serials findable`,
    ctaDescription:
      "Home Tech Vault stores serials, photos, and documents on each device record.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Device inventory",
    secondaryCtaHref: "/device-inventory",
  };
}

function composeInsurance(brand: SeoBrand): ProgrammaticGuidePage {
  const slug = brandInsuranceSlug(brand);
  const title = `How to Prepare ${brand.name} Devices for Insurance`;

  return {
    slug,
    path: `/guides/${slug}`,
    brandSlug: brand.slug,
    brandName: brand.name,
    intentId: "insurance-ready",
    group: "Insurance",
    title,
    metaTitle: `${title} | Home Tech Vault`,
    metaDescription: truncateMeta(
      `Build an insurance-ready inventory of ${brand.possessiveLabel} with photos, serials, values, and receipts before you need an adjuster.`
    ),
    keywords: [
      `${brand.name} insurance inventory`,
      `${brand.name} home inventory`,
      `${brand.name} device claim`,
    ],
    heroEyebrow: `${brand.name} insurance prep`,
    heroTitle: title,
    heroDescription: `Adjusters and you both move faster with dated photos, serials, and proof for ${brand.possessiveLabel}. Build the packet while everything still works.`,
    intro: [
      `Insurance time is the wrong moment to hunt serials for ${brand.possessiveLabel}. ${brand.facts[0]}`,
      "This guide covers a claim-ready packet: photos, values, proof, and household storage.",
      "You are not filing a claim today — you are removing future friction.",
    ],
    sections: [
      {
        id: "photo-set",
        heading: "Photo set that holds up",
        paragraphs: [
          "Wide room photo, device close-up, and serial label.",
          `Include docks, soundbars, or mesh nodes tied to ${brand.name} setups.`,
          "Re-shoot after major remodels or device refreshes.",
        ],
      },
      {
        id: "values",
        heading: "Values without obsession",
        paragraphs: [
          "Store purchase price when known; approximate replacement cost for older gear.",
          `Prioritize ${brand.products.slice(0, 3).join(", ")}.`,
          "Update values when you buy significant upgrades.",
        ],
      },
      {
        id: "proof",
        heading: "Proof packet",
        paragraphs: [
          "Receipts, bank statements, or order emails attached to each record.",
          brand.facts[2],
          "Note financing or store cards if they add purchase protection.",
        ],
      },
      {
        id: "offsite",
        heading: "Keep a copy you can reach offsite",
        paragraphs: [
          "A vault in the cloud beats a binder that burns with the house.",
          "Ensure a partner can access the household inventory.",
          brand.friction[0],
        ],
      },
      {
        id: "htv",
        heading: "Insurance-ready records in Home Tech Vault",
        paragraphs: [
          `Inventory ${brand.possessiveLabel}, attach proof, and keep serials current.`,
          "Export or share when an adjuster asks.",
          "Related warranty and organization guides keep the packet fresh.",
        ],
      },
    ],
    faq: [
      {
        question: "Does homeowners insurance cover all devices?",
        answer:
          "Policies vary. Inventory still helps for riders, renters policies, and negotiating settlements.",
      },
      {
        question: "How detailed should values be?",
        answer:
          "Good enough to replace the item. Round numbers beat blank fields.",
      },
      {
        question: `Should I include older ${brand.name} devices?`,
        answer:
          "Include anything you would realistically claim or need to prove ownership for.",
      },
      {
        question: "What about shared family devices?",
        answer:
          "List them once with the household owner noted so totals stay clean.",
      },
      {
        question: "Is a spreadsheet enough?",
        answer:
          "Spreadsheets die. A living inventory with attachments is harder to lose.",
      },
      {
        question: "How often should I refresh photos?",
        answer:
          "After big purchases, moves, or yearly during a seasonal checkup.",
      },
    ],
    relatedSlugs: [
      brandSerialsSlug(brand),
      brandWarrantySlug(brand),
      brandOrganizeSlug(brand),
    ],
    ctaTitle: `Make ${brand.name} gear claim-ready`,
    ctaDescription:
      "Home Tech Vault keeps photos, serials, and receipts together for calmer insurance moments.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Digital home vault",
    secondaryCtaHref: "/digital-home-vault",
  };
}

function composeTopicPage(intent: GuideIntent): ProgrammaticGuidePage | null {
  if (!intent.includeTopicPage || !intent.topicSlug || !intent.topicTitle) {
    return null;
  }

  if (intent.topicSlug === "how-to-store-router-passwords") {
    return {
      slug: intent.topicSlug,
      path: `/guides/${intent.topicSlug}`,
      brandSlug: null,
      brandName: null,
      intentId: "topic",
      group: intent.group,
      title: intent.topicTitle,
      metaTitle: `${intent.topicTitle} | Home Tech Vault`,
      metaDescription: truncateMeta(intent.topicDescription ?? intent.topicTitle),
      keywords: [
        "store router passwords",
        "wifi password organizer",
        "router admin password household",
      ],
      heroEyebrow: "Networking",
      heroTitle: intent.topicTitle,
      heroDescription:
        intent.topicDescription ??
        "Keep admin and Wi-Fi credentials recoverable for the household.",
      intro: [
        "Router passwords become tribal knowledge faster than almost any other household secret.",
        "The durable pattern is simple: password manager for secrets, household inventory for SSID names, node maps, and ISP account context.",
        "Use brand-specific router guides for Netgear, TP-Link, Ubiquiti, and ASUS when you need hardware-level detail.",
      ],
      sections: [
        {
          id: "secrets-vs-context",
          heading: "Secrets vs context",
          paragraphs: [
            "Passwords and passphrases belong in a password manager with emergency access for a partner.",
            "SSID names, guest network names, and which closet holds the gateway belong in Home Tech Vault.",
            "Never rely on a group text as the system of record.",
          ],
        },
        {
          id: "minimum-notes",
          heading: "Minimum network notes",
          paragraphs: [
            "Primary SSID, guest SSID, admin access method, ISP account number, modem/router serials.",
            "Mesh households should list node rooms.",
            "Photograph the rack or shelf once.",
          ],
        },
        {
          id: "who-can-admin",
          heading: "Who can admin",
          paragraphs: [
            "Fewer admins means fewer surprise changes.",
            "Document the named adults allowed to alter DNS, port forwards, or parental controls.",
            "House sitters get guest Wi-Fi, not admin.",
          ],
        },
        {
          id: "rotate",
          heading: "When to rotate",
          paragraphs: [
            "Rotate after roommate changes, vendor compromises, or sticker-password discoveries.",
            "Update the password manager first, then devices, then notes.",
            "Log the date you rotated in the network record.",
          ],
        },
        {
          id: "htv",
          heading: "Keep network context in Home Tech Vault",
          paragraphs: [
            "Create a network record, link routers and mesh nodes, and attach ISP PDFs.",
            "Browse brand router password guides for vendor-specific quirks.",
            "Pair with network documentation landing pages for broader setup habits.",
          ],
        },
      ],
      faq: [
        {
          question: "Is a password manager enough by itself?",
          answer:
            "It stores secrets well. You still need household context for SSIDs, hardware locations, and ISP details.",
        },
        {
          question: "Can I store passwords in Home Tech Vault?",
          answer:
            "Use a password manager for passwords. Use Home Tech Vault for device and network documentation.",
        },
        {
          question: "What about QR codes for Wi-Fi?",
          answer:
            "Fine for guests. Still keep the SSID documented and the passphrase in a proper vault.",
        },
        {
          question: "How do I handle multiple routers?",
          answer:
            "Inventory each unit and mark which is primary. Link them under one network record.",
        },
        {
          question: "Should kids get the admin password?",
          answer:
            "Usually no. Share guest Wi-Fi and app-level controls instead.",
        },
        {
          question: "What if we factory reset?",
          answer:
            "Your notes should say whether bridge mode or ISP VLAN settings must be restored afterward.",
        },
      ],
      relatedSlugs: SEO_BRANDS.filter((brand) =>
        brand.categories.includes("networking")
      )
        .slice(0, 3)
        .map((brand) => brandRouterPasswordSlug(brand)),
      ctaTitle: "Document your network once",
      ctaDescription:
        "Home Tech Vault keeps router context and ISP details beside your device inventory.",
      primaryCtaLabel: "Start free",
      primaryCtaHref: MARKETING_ROUTES.signup,
      secondaryCtaLabel: "Network documentation",
      secondaryCtaHref: "/network-documentation",
    };
  }

  if (intent.topicSlug === "how-to-track-tv-warranties") {
    return {
      slug: intent.topicSlug,
      path: `/guides/${intent.topicSlug}`,
      brandSlug: null,
      brandName: null,
      intentId: "topic",
      group: intent.group,
      title: intent.topicTitle,
      metaTitle: `${intent.topicTitle} | Home Tech Vault`,
      metaDescription: truncateMeta(intent.topicDescription ?? intent.topicTitle),
      keywords: [
        "track TV warranties",
        "television warranty tracker",
        "TV proof of purchase",
      ],
      heroEyebrow: "Warranties",
      heroTitle: intent.topicTitle,
      heroDescription:
        intent.topicDescription ??
        "Capture TV coverage before panel issues show up.",
      intro: [
        "TV warranties combine manufacturer coverage, retailer plans, and sometimes credit-card protections.",
        "Track them per television with serial, purchase proof, and end dates — brand pages below go deeper for Samsung, LG, Sony, Roku, and Fire TV.",
        "A living-room failure is expensive enough without an email archaeology project.",
      ],
      sections: [
        {
          id: "per-tv-record",
          heading: "One record per TV",
          paragraphs: [
            "Nickname by room, store model and serial, attach the receipt.",
            "Note wall-mount and soundbar pairings that affect replacement choices.",
            "Keep smart-TV account emails with the record.",
          ],
        },
        {
          id: "coverage-layers",
          heading: "Coverage layers",
          paragraphs: [
            "Manufacturer panel/parts terms differ from accidental plans.",
            "Write each end date separately.",
            "Extended plans need plan numbers on the same device record.",
          ],
        },
        {
          id: "claim-ready",
          heading: "Claim-ready details",
          paragraphs: [
            "Photos of the serial label and the TV in place.",
            "Symptom notes and purchase proof.",
            "Support case numbers when a claim starts.",
          ],
        },
        {
          id: "htv",
          heading: "Track TV warranties in Home Tech Vault",
          paragraphs: [
            "Attach documents to each TV device and set reminders before coverage ends.",
            "Use brand warranty guides for vendor portals.",
            "Pair with insurance-ready inventories for high-end OLEDs.",
          ],
        },
      ],
      faq: [
        {
          question: "Do OLEDs need special tracking?",
          answer:
            "They often have higher replacement cost — prioritize serials, panel coverage terms, and proof.",
        },
        {
          question: "What if I bought the TV years ago?",
          answer:
            "Rebuild what you can from bank history, retailer accounts, and the serial label. Partial records still help.",
        },
        {
          question: "Are soundbars separate warranties?",
          answer:
            "Usually yes. Give soundbars their own device records linked to the TV.",
        },
        {
          question: "Should streaming sticks be tracked?",
          answer:
            "Track them if you care about accounts and replacements; warranty value is lower but account ownership matters.",
        },
        {
          question: "How early should reminders fire?",
          answer:
            "30–60 days before coverage ends on expensive sets.",
        },
        {
          question: "Can family see the warranty dates?",
          answer:
            "Yes — share household access so one inbox is not the bottleneck.",
        },
      ],
      relatedSlugs: SEO_BRANDS.filter(
        (brand) =>
          brand.categories.includes("tv") ||
          brand.categories.includes("streaming")
      )
        .slice(0, 4)
        .map((brand) => brandWarrantySlug(brand)),
      ctaTitle: "Track every TV’s coverage",
      ctaDescription:
        "Home Tech Vault keeps warranty dates and receipts on each television record.",
      primaryCtaLabel: "Start free",
      primaryCtaHref: MARKETING_ROUTES.signup,
      secondaryCtaLabel: "Warranty tracker",
      secondaryCtaHref: "/warranty-tracker",
    };
  }

  if (intent.topicSlug === "how-to-organize-smart-home-devices") {
    return {
      slug: intent.topicSlug,
      path: `/guides/${intent.topicSlug}`,
      brandSlug: null,
      brandName: null,
      intentId: "topic",
      group: intent.group,
      title: intent.topicTitle,
      metaTitle: `${intent.topicTitle} | Home Tech Vault`,
      metaDescription: truncateMeta(intent.topicDescription ?? intent.topicTitle),
      keywords: [
        "organize smart home devices",
        "smart home inventory",
        "home automation records",
      ],
      heroEyebrow: "Smart home",
      heroTitle: intent.topicTitle,
      heroDescription:
        intent.topicDescription ??
        "Inventory hubs, sensors, and speakers above vendor apps.",
      intro: [
        "Smart homes fail organizationally before they fail technically — too many apps, too many rooms, too many ghost devices.",
        "Build one household inventory that sits above Google Nest, Ring, Eufy, Sonos, and the rest.",
        "Brand-specific smart-home guides add vendor detail; this page sets the shared habits.",
      ],
      sections: [
        {
          id: "above-apps",
          heading: "Inventory above apps",
          paragraphs: [
            "Apps control devices. Your inventory explains the household.",
            "List hubs first, then security devices, then comfort devices.",
            "Use consistent room names everywhere.",
          ],
        },
        {
          id: "access",
          heading: "Access map",
          paragraphs: [
            "Document which email owns each ecosystem.",
            "Remove former roommates from shared homes.",
            "Give sitters limited access paths.",
          ],
        },
        {
          id: "maintenance",
          heading: "Maintenance hooks",
          paragraphs: [
            "Battery sensors need replacement dates.",
            "Cameras need storage-mode notes.",
            "Firmware checkups can ride seasonal maintenance.",
          ],
        },
        {
          id: "htv",
          heading: "Organize it in Home Tech Vault",
          paragraphs: [
            "Create device records, attach manuals, and share a household view.",
            "Jump into brand guides for Nest, Ring, Eufy, and Sonos.",
            "Keep networking notes linked for Wi-Fi dependent gear.",
          ],
        },
      ],
      faq: [
        {
          question: "Do I need one app to rule them all?",
          answer:
            "No. You need one inventory of record. Control can stay in vendor apps or a hub you already use.",
        },
        {
          question: "What is the first hour of work?",
          answer:
            "List hubs and cameras with rooms and owner emails. Expand later.",
        },
        {
          question: "How do I handle Matter/Thread bridges?",
          answer:
            "Inventory the bridge as a hub device and note which endpoints depend on it.",
        },
        {
          question: "Should guests see the inventory?",
          answer:
            "Usually not. Share only what a sitter needs for entry and emergencies.",
        },
        {
          question: "What about IR remotes and dead bulbs?",
          answer:
            "Remove ghosts quarterly so troubleshooting stays honest.",
        },
        {
          question: "Can this help with insurance?",
          answer:
            "Yes — serials and photos of hubs and cameras support claims.",
        },
      ],
      relatedSlugs: SEO_BRANDS.filter((brand) =>
        brand.categories.includes("smart-home")
      )
        .slice(0, 4)
        .map((brand) => brandSmartHomeSlug(brand)),
      ctaTitle: "Organize the smart home once",
      ctaDescription:
        "Home Tech Vault keeps hubs, rooms, and device records above the apps you already open daily.",
      primaryCtaLabel: "Start free",
      primaryCtaHref: MARKETING_ROUTES.signup,
      secondaryCtaLabel: "Smart home organizer",
      secondaryCtaHref: "/smart-home-organizer",
    };
  }

  return null;
}

function composePageForBrandIntent(
  brand: SeoBrand,
  intent: GuideIntent
): ProgrammaticGuidePage | null {
  if (!brandMatchesIntent(brand, intent)) {
    return null;
  }

  switch (intent.id) {
    case "organize-devices":
      return composeOrganizeDevices(brand);
    case "organize-product":
      return composeOrganizeProduct(brand, intent);
    case "track-warranties":
      return composeTrackWarranties(brand);
    case "store-router-passwords":
      return composeRouterPasswords(brand);
    case "organize-smart-home":
      return composeSmartHome(brand);
    case "document-serials":
      return composeSerials(brand);
    case "insurance-ready":
      return composeInsurance(brand);
    default:
      return null;
  }
}

let cachedPages: ProgrammaticGuidePage[] | null = null;

/**
 * Build the full programmatic guide catalog (brands × intents + topic pages).
 */
export function getAllProgrammaticGuides(): ProgrammaticGuidePage[] {
  if (cachedPages) {
    return cachedPages;
  }

  const pages: ProgrammaticGuidePage[] = [];
  const seen = new Set<string>();

  for (const intent of GUIDE_INTENTS) {
    const topic = composeTopicPage(intent);
    if (topic && !seen.has(topic.slug)) {
      seen.add(topic.slug);
      pages.push(topic);
    }

    for (const brand of SEO_BRANDS) {
      const page = composePageForBrandIntent(brand, intent);
      if (page && !seen.has(page.slug)) {
        seen.add(page.slug);
        pages.push(page);
      }
    }
  }

  // Resolve related slugs to only existing pages; backfill from same brand / group.
  const bySlug = new Map(pages.map((page) => [page.slug, page]));

  for (const page of pages) {
    const resolved: string[] = [];
    for (const relatedSlug of page.relatedSlugs) {
      if (bySlug.has(relatedSlug) && relatedSlug !== page.slug) {
        resolved.push(relatedSlug);
      }
    }

    if (resolved.length < 3) {
      for (const candidate of pages) {
        if (resolved.length >= 3) {
          break;
        }
        if (candidate.slug === page.slug) {
          continue;
        }
        if (
          (page.brandSlug &&
            candidate.brandSlug === page.brandSlug) ||
          candidate.group === page.group
        ) {
          if (!resolved.includes(candidate.slug)) {
            resolved.push(candidate.slug);
          }
        }
      }
    }

    page.relatedSlugs = resolved.slice(0, 4);
  }

  cachedPages = pages;
  return pages;
}

export function getProgrammaticGuide(
  slug: string
): ProgrammaticGuidePage | null {
  return (
    getAllProgrammaticGuides().find((page) => page.slug === slug) ??
    null
  );
}

export function getProgrammaticGuidesByBrand(
  brandSlug: string
): ProgrammaticGuidePage[] {
  return getAllProgrammaticGuides().filter(
    (page) => page.brandSlug === brandSlug
  );
}

export function getRelatedProgrammaticGuides(
  page: ProgrammaticGuidePage
): ProgrammaticRelatedLink[] {
  return page.relatedSlugs
    .map((slug) => getProgrammaticGuide(slug))
    .filter((item): item is ProgrammaticGuidePage => item !== null)
    .map((item) => ({
      href: item.path,
      title: item.title,
      description: item.metaDescription,
    }));
}

export function listProgrammaticGuideStaticParams() {
  return getAllProgrammaticGuides().map((page) => ({
    slug: page.slug,
  }));
}

export function programmaticGuideSitemapEntries(siteUrl: string) {
  return getAllProgrammaticGuides().map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: page.brandSlug ? 0.6 : 0.7,
  }));
}
