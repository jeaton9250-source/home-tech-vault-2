import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";

export type ComparisonCell = string;

export type ComparisonTable = {
  caption: string;
  /** First column is the feature/criterion label */
  columns: string[];
  rows: Array<{
    feature: string;
    values: ComparisonCell[];
  }>;
};

export type ComparisonSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type ComparisonFaq = {
  question: string;
  answer: string;
};

export type ComparisonPage = {
  slug: string;
  path: string;
  kind: "versus" | "best-of";
  competitorName: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  intro: string[];
  whenAlternativeWins: string[];
  whenHtvWins: string[];
  sections: ComparisonSection[];
  table: ComparisonTable;
  faq: ComparisonFaq[];
  relatedSlugs: string[];
  ctaTitle: string;
  ctaDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

const HTV = siteConfig.name;

function pathFor(slug: string) {
  return `/compare/${slug}`;
}

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: "home-tech-vault-vs-sortly",
    path: pathFor("home-tech-vault-vs-sortly"),
    kind: "versus",
    competitorName: "Sortly",
    title: `${HTV} vs Sortly`,
    metaTitle: "Sortly Alternative for Home Inventory | Home Tech Vault",
    metaDescription:
      "Looking for a Sortly alternative for home use? Compare Home Tech Vault and Sortly for devices, warranties, receipts, manuals, serial numbers, and household organization.",
    keywords: [
      "Sortly alternative",
      "Sortly alternative for home inventory",
      "Sortly home inventory alternative",
      "Home Tech Vault vs Sortly",
      "Sortly vs Home Tech Vault",
      "home inventory app",
      "home inventory software",
      "warranty tracker app",
      "device inventory software",
      "appliance inventory app",
      "electronics inventory app",
      "receipt organizer",
    ],
    heroEyebrow: "Sortly Alternative",
    heroTitle: "A Sortly Alternative Built for Home Inventory",
    heroDescription:
      "Sortly is a flexible inventory platform. Home Tech Vault takes a more focused approach for homeowners — keeping devices, appliances, receipts, warranties, manuals, serial numbers, and purchase information together in one household vault.",
    intro: [
      "If you are considering Sortly for your home inventory, the biggest difference is scope. Sortly is a broad inventory platform designed for many kinds of physical assets, while Home Tech Vault is focused specifically on household technology and appliances.",
      "Home Tech Vault organizes the information homeowners are most likely to need when something breaks, needs service, gets replaced, or requires a warranty claim: the device, model, serial number, purchase information, receipt, warranty, manual, and supporting documents.",
      "Neither approach is automatically better. Sortly may make more sense when you need a flexible general inventory system. Home Tech Vault may fit better when the primary goal is keeping household devices and their important records organized without building a broader asset-management workflow.",
    ],
    whenAlternativeWins: [
      "You need a general inventory platform that can track many different types of physical assets.",
      "Your inventory extends beyond household technology into equipment, supplies, tools, or business assets.",
      "Barcode, quantity, and broader asset-management workflows are more important than household warranty organization.",
      "You want one flexible inventory system that can serve both personal and professional use cases.",
    ],
    whenHtvWins: [
      "Your main goal is organizing household technology and appliances.",
      "You want receipts, warranties, manuals, serial numbers, and purchase information connected to the device they belong to.",
      "You want a simpler household-focused system instead of configuring a general inventory platform.",
      "You want family members to be able to find important device information without learning an asset-management system.",
    ],
    sections: [
      {
        id: "sortly-alternative",
        heading: "Why homeowners look for a Sortly alternative",
        paragraphs: [
          "Sortly is built to handle broad inventory needs. That flexibility is valuable, but some homeowners do not need a full inventory-management platform to remember which television they bought, when the refrigerator warranty expires, or where the router receipt lives.",
          "A household technology inventory has a narrower job: preserve the information that becomes important during repairs, warranty claims, support calls, replacements, moves, and insurance documentation.",
          "Home Tech Vault focuses its experience around that narrower problem. Instead of starting with generic inventory items, the system emphasizes devices, rooms, model numbers, serial numbers, warranties, receipts, manuals, maintenance, and household access.",
        ],
      },
      {
        id: "home-inventory",
        heading: "General inventory vs home technology inventory",
        paragraphs: [
          "Sortly can be used for home inventory, but its structure is broad enough to support everything from household belongings to professional equipment.",
          "Home Tech Vault deliberately gives up some of that breadth in exchange for a more opinionated household technology workflow.",
          "If your inventory includes every possession, supply, tool, and box in storage, a broader inventory system may be appropriate. If your priority is appliances, electronics, smart-home devices, network equipment, warranties, receipts, and manuals, a specialized vault can reduce setup and maintenance.",
        ],
      },
      {
        id: "warranties",
        heading: "Warranty tracking and proof of purchase",
        paragraphs: [
          "Knowing that you own an item is not enough when a warranty claim starts. You may also need the purchase date, model, serial number, receipt, warranty document, and other proof.",
          "Home Tech Vault is structured around keeping those records close to the device they belong to rather than treating them as unrelated files.",
          "That difference matters most when something fails unexpectedly. The goal is to open one record and find the information needed for support instead of searching email, cloud drives, drawers, and old boxes.",
        ],
      },
      {
        id: "documents",
        heading: "Receipts, manuals, and device documents",
        paragraphs: [
          "Receipts and manuals are easy to save and surprisingly hard to find months or years later.",
          "A household-focused inventory works best when documents remain attached to the device context: which refrigerator the receipt belongs to, which television the warranty covers, and which router a manual describes.",
          "Home Tech Vault emphasizes that relationship so the inventory acts as more than a list of things you own.",
        ],
      },
      {
        id: "household",
        heading: "Built around a household instead of an asset database",
        paragraphs: [
          "Many inventory platforms are designed with businesses, warehouses, equipment, or professional asset tracking in mind.",
          "Home Tech Vault uses a household mental model instead: devices live in rooms, family members may need access, warranties have expiration dates, and documents exist because someone may need them during a real-world problem.",
          "That narrower experience can be easier for families that want organization without turning home inventory into another system they need to administer.",
        ],
      },
      {
        id: "which-is-better",
        heading: "Which is better: Sortly or Home Tech Vault?",
        paragraphs: [
          "Choose Sortly when flexibility and broad inventory management are the priority.",
          "Choose Home Tech Vault when the inventory is primarily about household technology, appliances, warranties, receipts, manuals, serial numbers, and related records.",
          "The deciding question is not which product has more inventory features. It is whether you need a general inventory platform or a purpose-built home technology vault.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Sortly is a strong fit for users who need broad inventory management across many kinds of assets.",
          "Home Tech Vault is designed for a narrower customer: homeowners who want important technology information organized before something breaks.",
          "If your main frustration is finding receipts, warranty information, manuals, serial numbers, and device details, the specialized workflow may be more useful than a general-purpose inventory system.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs Sortly for home inventory",
      columns: ["Criterion", HTV, "Sortly"],
      rows: [
        {
          feature: "Primary purpose",
          values: [
            "Household technology organization",
            "General inventory and asset tracking",
          ],
        },
        {
          feature: "Home inventory focus",
          values: [
            "Purpose-built around household devices",
            "One of many possible inventory use cases",
          ],
        },
        {
          feature: "Device records",
          values: [
            "Structured around electronics and appliances",
            "General inventory item records",
          ],
        },
        {
          feature: "Warranty tracking",
          values: [
            "Focused on coverage dates and supporting proof",
            "Can be represented within general inventory records",
          ],
        },
        {
          feature: "Receipts",
          values: ["Stored in device context", "Can be attached to inventory items"],
        },
        {
          feature: "Manuals",
          values: ["Kept with the related device", "Can be stored as item attachments"],
        },
        {
          feature: "Serial numbers",
          values: ["Core device information", "Available as inventory information"],
        },
        {
          feature: "Household organization",
          values: ["Rooms, devices, household records", "Flexible inventory organization"],
        },
        {
          feature: "Business inventory",
          values: ["Not the primary use case", "Broader inventory capabilities"],
        },
        {
          feature: "Best fit",
          values: [
            "Homeowners organizing technology and warranties",
            "Users needing flexible general inventory management",
          ],
        },
      ],
    },
    faq: [
      {
        question: "What is a good Sortly alternative for home inventory?",
        answer:
          "Home Tech Vault is an alternative for homeowners whose main goal is organizing appliances, electronics, warranties, receipts, manuals, serial numbers, and purchase information. Sortly has a broader inventory focus.",
      },
      {
        question: "Is Home Tech Vault a Sortly alternative?",
        answer:
          "Yes, for household technology inventory. Home Tech Vault focuses specifically on devices, appliances, warranties, receipts, manuals, and household records, while Sortly supports broader inventory use cases.",
      },
      {
        question: "Can Sortly be used for home inventory?",
        answer:
          "Yes. Sortly can be used to track household possessions and other physical assets. The main difference is that Home Tech Vault is purpose-built around household technology and related documentation.",
      },
      {
        question: "Which is better for tracking appliance warranties?",
        answer:
          "Home Tech Vault is designed around keeping warranty dates and supporting records with the appliance or device. Sortly can also store inventory information and attachments but serves a broader inventory purpose.",
      },
      {
        question: "Which is better for receipts and manuals?",
        answer:
          "Both approaches can retain documents. Home Tech Vault emphasizes keeping receipts, manuals, warranties, and other documents directly connected to household device records.",
      },
      {
        question: "Is Home Tech Vault only for electronics?",
        answer:
          "Home Tech Vault is designed primarily around home technology and appliances. That narrower focus is useful for households that do not need a general inventory system for every possession.",
      },
      {
        question: "Does Home Tech Vault replace business inventory software?",
        answer:
          "No. Home Tech Vault is designed for household technology. Businesses that need quantity tracking, supply management, or broader asset workflows should use inventory software designed for those needs.",
      },
      {
        question: "Can I start Home Tech Vault for free?",
        answer:
          "Yes. Home Tech Vault has a free plan so you can start with a few important devices and build your household inventory over time.",
      },
    ],
    relatedSlugs: [
      "best-home-inventory-software",
      "best-warranty-tracker",
      "home-tech-vault-vs-notion",
      "home-tech-vault-vs-google-sheets",
    ],
    ctaTitle: "Looking for a simpler Sortly alternative for your home?",
    ctaDescription:
      "Start with one device. Keep its receipt, warranty, manual, serial number, and purchase information together, then build your Home Tech Vault over time.",
    primaryCtaLabel: "Create My Free Vault",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Explore Home Inventory",
    secondaryCtaHref: "/home-inventory-software",
  },
  {
    slug: "home-tech-vault-vs-notion",
    path: pathFor("home-tech-vault-vs-notion"),
    kind: "versus",
    competitorName: "Notion",
    title: `${HTV} vs Notion`,
    metaTitle: `${HTV} vs Notion — Home Tech Inventory Compared`,
    metaDescription:
      "An objective comparison of Home Tech Vault and Notion for household device inventory, warranties, and documents — strengths, tradeoffs, and who each tool fits.",
    keywords: [
      "Home Tech Vault vs Notion",
      "Notion home inventory",
      "home tech inventory software",
    ],
    heroEyebrow: "Comparison",
    heroTitle: `${HTV} vs Notion`,
    heroDescription:
      "Notion is a flexible workspace. Home Tech Vault is purpose-built for household technology records. Here is how they differ without the marketing fog.",
    intro: [
      "People often start a home inventory in Notion because they already live there — databases, pages, and templates feel familiar. That works until the household needs structured warranties, device serials, shared family access, and documents that stay attached to the right item.",
      "Home Tech Vault takes the opposite approach: fewer blank canvases, more opinionated fields for devices, rooms, warranties, and network notes.",
      "Neither tool is universally better. The right choice depends on whether you want a general workspace you shape yourself, or a home-tech system that already knows what to ask for.",
    ],
    whenAlternativeWins: [
      "You want one workspace for notes, projects, and inventory side by side.",
      "Your household already maintains Notion databases and is willing to design schemas.",
      "You need freeform pages more than device-specific workflows.",
    ],
    whenHtvWins: [
      "You want device, warranty, and document fields without building a database from scratch.",
      "Family members need clear roles without learning a wiki.",
      "You care about claim-ready serials, receipts, and coverage dates in one product.",
    ],
    sections: [
      {
        id: "purpose",
        heading: "Purpose and mental model",
        paragraphs: [
          "Notion starts as an empty page or database. You decide properties, views, and relations. That flexibility is its strength — and the reason inventories stall when nobody wants to be the schema owner.",
          "Home Tech Vault starts with household technology objects: devices, documents, warranties, maintenance, and network context. You fill in records instead of inventing the system.",
          "If your primary job is writing and planning, Notion remains excellent. If the primary job is remembering what you own and when coverage ends, a dedicated inventory product reduces setup and drift.",
        ],
      },
      {
        id: "structure",
        heading: "Structure for devices and warranties",
        paragraphs: [
          "In Notion you can model serial numbers, rooms, and warranty end dates — but every household reinvents naming, required fields, and file attachment habits.",
          "Home Tech Vault expects those fields and keeps documents next to the device they belong to. That matters when support asks for a serial and a receipt in the same conversation.",
          "Notion wins for custom properties you invent once and love. HTV wins when you would rather not invent them.",
        ],
      },
      {
        id: "sharing",
        heading: "Sharing with a household",
        paragraphs: [
          "Notion sharing is powerful and sometimes sprawling — workspace permissions, page shares, and guest access require attention.",
          "Home Tech Vault focuses on household membership and roles aimed at family inventories rather than company wikis.",
          "Teams that already run life in Notion may prefer staying put. Households that only need tech records often prefer a smaller surface area.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Choose Notion if inventory is one page among many and you enjoy maintaining databases.",
          "Choose Home Tech Vault if inventory is the job: devices, warranties, documents, and calmer support or insurance moments.",
          "Some households use both — Notion for life admin, HTV for the tech vault — and that split is reasonable.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs Notion at a glance",
      columns: ["Criterion", HTV, "Notion"],
      rows: [
        {
          feature: "Primary purpose",
          values: [
            "Home tech inventory & documents",
            "General workspace & databases",
          ],
        },
        {
          feature: "Setup time for inventory",
          values: [
            "Low — structured device records",
            "Medium–high — you design the schema",
          ],
        },
        {
          feature: "Warranty tracking",
          values: [
            "Built around coverage dates & proof",
            "Possible via custom properties",
          ],
        },
        {
          feature: "Document attachments",
          values: [
            "Tied to devices and household vault",
            "Files on pages/databases you configure",
          ],
        },
        {
          feature: "Household roles",
          values: [
            "Household-focused sharing",
            "Workspace/page permission model",
          ],
        },
        {
          feature: "Flexibility",
          values: [
            "Opinionated for home tech",
            "Extremely flexible blank canvas",
          ],
        },
        {
          feature: "Best fit",
          values: [
            "Households organizing electronics",
            "People already living in Notion",
          ],
        },
      ],
    },
    faq: [
      {
        question: "Can Notion replace a home inventory app?",
        answer:
          "Yes for motivated households that maintain databases. Many abandon templates after a few weeks. A dedicated product reduces that maintenance.",
      },
      {
        question: "Is Home Tech Vault more limited than Notion?",
        answer:
          "For general notes and project management, yes. For device serials, warranties, and tech documents, HTV is more direct.",
      },
      {
        question: "Can I export from Notion into Home Tech Vault?",
        answer:
          "You can migrate key fields manually or via spreadsheet export. Start with high-value devices rather than every page.",
      },
      {
        question: "Which is cheaper?",
        answer:
          "Notion has a free tier and paid plans for advanced features. Home Tech Vault offers Free, Pro ($7.99), and Family ($14.99). Compare based on whether you need a full workspace or a tech vault.",
      },
      {
        question: "What about mobile use?",
        answer:
          "Both are usable on phones. HTV’s flows assume inventory tasks; Notion’s mobile experience depends on how complex your databases are.",
      },
      {
        question: "Should I move everything out of Notion?",
        answer:
          "Not necessarily. Keep writing and planning in Notion if it works. Move device/warranty records if those pages keep going stale.",
      },
    ],
    relatedSlugs: [
      "home-tech-vault-vs-airtable",
      "home-tech-vault-vs-google-sheets",
      "best-home-inventory-software",
    ],
    ctaTitle: "Try a vault built for home tech",
    ctaDescription:
      "Start free with structured devices, documents, and warranties — without designing a Notion database first.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "See pricing",
    secondaryCtaHref: MARKETING_ROUTES.pricing,
  },
  {
    slug: "home-tech-vault-vs-spreadsheet",
    path: pathFor("home-tech-vault-vs-spreadsheet"),
    kind: "versus",
    competitorName: "Spreadsheets",
    title: `${HTV} vs Spreadsheet`,
    metaTitle: `${HTV} vs Spreadsheet — Home Inventory Compared`,
    metaDescription:
      "Compare Home Tech Vault with a classic spreadsheet inventory: flexibility, file attachments, warranties, sharing, and when a sheet is still enough.",
    keywords: [
      "home inventory spreadsheet",
      "Home Tech Vault vs spreadsheet",
      "device inventory excel",
    ],
    heroEyebrow: "Comparison",
    heroTitle: `${HTV} vs Spreadsheet`,
    heroDescription:
      "Spreadsheets are honest tools. Home Tech Vault is for when rows stop being enough — receipts, serial photos, warranties, and household access.",
    intro: [
      "Almost every home inventory begins as a spreadsheet. Columns for item, room, price, and notes are clear, portable, and free if you already have Excel or similar.",
      "Problems appear when you need attachments per device, warranty reminders, safer sharing, and less chance that “Final_Inventory_v7.xlsx” is the wrong file.",
      "This comparison stays practical: keep the sheet if it still works; move when the household outgrows rows.",
    ],
    whenAlternativeWins: [
      "Your list is short and mostly text fields.",
      "You need heavy custom calculations or pivot analysis.",
      "Offline desktop files are a hard requirement.",
    ],
    whenHtvWins: [
      "You attach receipts, manuals, and serial photos to devices.",
      "Warranties and maintenance need dates, not buried columns.",
      "More than one person should view or update without emailing files.",
    ],
    sections: [
      {
        id: "rows-vs-records",
        heading: "Rows versus device records",
        paragraphs: [
          "A spreadsheet row is a flexible bag of cells. That is perfect for ad hoc lists and terrible for consistent document linking.",
          "Home Tech Vault treats each device as a record with room, serial, documents, and coverage fields that stay together.",
          "If you rarely attach files, a sheet may be enough. If claims and support depend on proof, records win.",
        ],
      },
      {
        id: "versioning",
        heading: "Versions and truth",
        paragraphs: [
          "Emailing spreadsheets creates forks. Cloud sheets help, but column drift and accidental sorts still happen.",
          "A shared household vault keeps one living inventory with clearer ownership of updates.",
          "Power users who live in formulas may still prefer sheets for analysis and export HTV data when needed.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Stay on a spreadsheet for a simple list you update alone.",
          "Move to Home Tech Vault when documents, warranties, and family access become part of the job.",
          "Many people export a sheet once as a starting point, then maintain HTV going forward.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs spreadsheet inventories",
      columns: ["Criterion", HTV, "Spreadsheet"],
      rows: [
        {
          feature: "Core unit",
          values: ["Device / document records", "Rows and columns"],
        },
        {
          feature: "File attachments",
          values: [
            "Per-device documents",
            "Awkward (links or separate folders)",
          ],
        },
        {
          feature: "Warranty dates",
          values: [
            "First-class fields & reminders",
            "Columns you maintain manually",
          ],
        },
        {
          feature: "Household sharing",
          values: [
            "Roles inside the product",
            "File sharing / cloud sheet ACLs",
          ],
        },
        {
          feature: "Customization",
          values: [
            "Structured for home tech",
            "Unlimited columns and formulas",
          ],
        },
        {
          feature: "Risk of stale copies",
          values: ["Single living inventory", "High if files are emailed"],
        },
        {
          feature: "Best fit",
          values: [
            "Ongoing household tech vault",
            "Simple solo lists & analysis",
          ],
        },
      ],
    },
    faq: [
      {
        question: "Is a spreadsheet bad for home inventory?",
        answer:
          "No. It is a solid starting point. It becomes painful when attachments, reminders, and multi-person updates matter.",
      },
      {
        question: "Can I import my spreadsheet?",
        answer:
          "You can use it as a checklist while creating device records. Prioritize high-value items first.",
      },
      {
        question: "Do I lose formulas in Home Tech Vault?",
        answer:
          "HTV is not a spreadsheet. Keep analytical sheets if you need them; use HTV as the system of record for ownership and proof.",
      },
      {
        question: "What about Google Sheets specifically?",
        answer:
          "See the dedicated Google Sheets comparison — similar tradeoffs with better real-time collaboration than emailing Excel files.",
      },
      {
        question: "Will HTV replace every spreadsheet I have?",
        answer:
          "No. Budgets, renovation trackers, and custom calculators can stay in sheets.",
      },
      {
        question: "How do I know I’ve outgrown a sheet?",
        answer:
          "Symptoms: missing receipts, duplicate files, nobody trusts the columns, and warranty dates are wrong.",
      },
    ],
    relatedSlugs: [
      "home-tech-vault-vs-google-sheets",
      "home-tech-vault-vs-airtable",
      "best-home-inventory-software",
    ],
    ctaTitle: "Outgrow the inventory spreadsheet",
    ctaDescription:
      "Keep devices, receipts, and warranties in one household vault — free to start.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "See how it works",
    secondaryCtaHref: MARKETING_ROUTES.demo,
  },
  {
    slug: "home-tech-vault-vs-google-sheets",
    path: pathFor("home-tech-vault-vs-google-sheets"),
    kind: "versus",
    competitorName: "Google Sheets",
    title: `${HTV} vs Google Sheets`,
    metaTitle: `${HTV} vs Google Sheets — Inventory & Warranties`,
    metaDescription:
      "Objective look at Home Tech Vault versus Google Sheets for home device inventories: collaboration, attachments, warranties, and when Sheets is still the right tool.",
    keywords: [
      "Home Tech Vault vs Google Sheets",
      "Google Sheets home inventory",
      "warranty tracker spreadsheet",
    ],
    heroEyebrow: "Comparison",
    heroTitle: `${HTV} vs Google Sheets`,
    heroDescription:
      "Google Sheets collaborates well. Home Tech Vault is built so device proof and warranties do not live in column AE.",
    intro: [
      "Google Sheets improves on emailed Excel files: one URL, comments, and simultaneous edits. Many households keep a durable inventory there for years.",
      "The gaps show up around binary proof (PDFs, photos), opinionated warranty fields, and product workflows that are not “just another tab.”",
      "Use this page to decide whether Sheets remains enough or whether a dedicated vault reduces friction.",
    ],
    whenAlternativeWins: [
      "Your inventory is mostly text and numbers with light collaboration.",
      "You already standardize on Google Workspace for household admin.",
      "You need arbitrary formulas, charts, or imports from other sheets.",
    ],
    whenHtvWins: [
      "Receipts and manuals should attach to devices, not Drive folder mazes.",
      "Warranty and maintenance dates deserve first-class handling.",
      "You want a product UX aimed at home tech instead of a grid.",
    ],
    sections: [
      {
        id: "collaboration",
        heading: "Collaboration",
        paragraphs: [
          "Sheets shines at shared editing. Permissions are familiar if the household already uses Google accounts.",
          "Home Tech Vault shares through household membership oriented around inventory roles rather than spreadsheet ACLs.",
          "If everyone is fluent in Sheets, switching costs matter — only move when the grid fights you.",
        ],
      },
      {
        id: "attachments",
        heading: "Attachments and Drive sprawl",
        paragraphs: [
          "Linking Drive files from cells works until naming conventions collapse.",
          "HTV keeps documents in context with the device record so support and insurance packets assemble faster.",
          "Sheets + a disciplined Drive folder can work; discipline is the scarce resource.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Keep Google Sheets for lightweight lists and household calculations.",
          "Choose Home Tech Vault when proof, warranties, and device context are the main workload.",
          "A hybrid is common: Sheets for budgets, HTV for the tech vault.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs Google Sheets",
      columns: ["Criterion", HTV, "Google Sheets"],
      rows: [
        {
          feature: "Real-time collaboration",
          values: ["Household sharing", "Excellent multiplayer editing"],
        },
        {
          feature: "Device-centric records",
          values: ["Native", "DIY with columns"],
        },
        {
          feature: "PDFs & photos",
          values: [
            "Attached to devices",
            "Drive links / separate storage",
          ],
        },
        {
          feature: "Warranty workflows",
          values: ["Built-in dates & docs", "Custom columns + reminders DIY"],
        },
        {
          feature: "Formulas & analysis",
          values: ["Limited vs sheets", "Full spreadsheet power"],
        },
        {
          feature: "Learning curve",
          values: [
            "Inventory product concepts",
            "Low if you already use Sheets",
          ],
        },
        {
          feature: "Best fit",
          values: [
            "Home tech system of record",
            "Flexible lists & calculations",
          ],
        },
      ],
    },
    faq: [
      {
        question: "Is Google Sheets free for this?",
        answer:
          "Personal Google accounts include Sheets at no extra cost. Home Tech Vault has a Free plan plus paid tiers for higher limits and family sharing.",
      },
      {
        question: "Can Sheets send warranty reminders?",
        answer:
          "With scripts or add-ons, yes. HTV treats coverage dates as part of the product rather than a side project.",
      },
      {
        question: "What migrates cleanly?",
        answer:
          "Names, rooms, purchase dates, and serials. Recreate document attachments by uploading proof to each device.",
      },
      {
        question: "Does HTV replace Google Drive?",
        answer:
          "No. It stores inventory-related documents in context. Broad file storage can stay in Drive.",
      },
      {
        question: "Which is better for insurance?",
        answer:
          "Either can work with photos and values. HTV’s per-device attachments usually assemble a packet faster than hunting Drive links.",
      },
      {
        question: "Can both stay in the stack?",
        answer:
          "Yes. Many households keep Sheets for money tracking and HTV for devices.",
      },
    ],
    relatedSlugs: [
      "home-tech-vault-vs-spreadsheet",
      "home-tech-vault-vs-airtable",
      "best-warranty-tracker",
    ],
    ctaTitle: "Move beyond inventory tabs",
    ctaDescription:
      "Put devices, warranties, and proof in Home Tech Vault — start free.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Warranty tracker",
    secondaryCtaHref: "/warranty-tracker",
  },
  {
    slug: "home-tech-vault-vs-airtable",
    path: pathFor("home-tech-vault-vs-airtable"),
    kind: "versus",
    competitorName: "Airtable",
    title: `${HTV} vs Airtable`,
    metaTitle: `${HTV} vs Airtable — Home Inventory Databases`,
    metaDescription:
      "Compare Home Tech Vault and Airtable for home inventories: relational power vs purpose-built device and warranty workflows.",
    keywords: [
      "Home Tech Vault vs Airtable",
      "Airtable home inventory",
      "home inventory database",
    ],
    heroEyebrow: "Comparison",
    heroTitle: `${HTV} vs Airtable`,
    heroDescription:
      "Airtable is a relational database with friendly interfaces. Home Tech Vault is a home-tech product with less base-building and more household defaults.",
    intro: [
      "Airtable attracts people who outgrew spreadsheets but still want tables, links, and views. You can build an impressive home inventory base — including attachments and interfaces.",
      "The cost is design and maintenance. Someone becomes the base owner. When that person gets busy, the inventory softens.",
      "Home Tech Vault trades open-ended base design for defaults that match devices, documents, and warranties.",
    ],
    whenAlternativeWins: [
      "You enjoy building bases and interfaces.",
      "Inventory must relate to custom projects beyond home tech.",
      "Your household already pays for and standardizes on Airtable.",
    ],
    whenHtvWins: [
      "You want inventory without becoming a database admin.",
      "Warranty and document workflows should be ready on day one.",
      "Family members need a simpler mental model than linked records.",
    ],
    sections: [
      {
        id: "database-vs-product",
        heading: "Database platform vs product",
        paragraphs: [
          "Airtable’s strength is modeling anything: assets, vendors, rooms, maintenance jobs — with linked records and automations.",
          "Home Tech Vault’s strength is not modeling anything; it is modeling home technology well enough that most households never open a schema editor.",
          "If you need a platform, Airtable fits. If you need a finished inventory product, HTV fits.",
        ],
      },
      {
        id: "effort",
        heading: "Ongoing effort",
        paragraphs: [
          "Airtable bases require occasional redesign as needs change — new fields, new views, permission tweaks.",
          "HTV evolves as a product; households mainly add and update records.",
          "Neither removes the need to stay honest about what you own — only where the structure comes from differs.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Pick Airtable when customization is the point.",
          "Pick Home Tech Vault when finishing the inventory is the point.",
          "Builders who love Airtable should stay; everyone else can skip the base-building phase.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs Airtable",
      columns: ["Criterion", HTV, "Airtable"],
      rows: [
        {
          feature: "Type of tool",
          values: [
            "Home tech inventory product",
            "Relational database platform",
          ],
        },
        {
          feature: "Schema design",
          values: ["Provided", "You design tables & links"],
        },
        {
          feature: "Attachments",
          values: ["Device-linked documents", "Attachment fields you configure"],
        },
        {
          feature: "Automations",
          values: [
            "Product workflows (e.g. reminders)",
            "Highly configurable automations",
          ],
        },
        {
          feature: "Learning curve",
          values: ["Inventory concepts", "Database + interface concepts"],
        },
        {
          feature: "Best fit",
          values: [
            "Households wanting defaults",
            "Builders who want a custom base",
          ],
        },
      ],
    },
    faq: [
      {
        question: "Is Airtable overkill for home inventory?",
        answer:
          "For simple lists, often yes. For people who enjoy databases, it can be a great fit.",
      },
      {
        question: "Does Home Tech Vault have views like Airtable?",
        answer:
          "HTV organizes around household inventory features rather than arbitrary grid/interface builders.",
      },
      {
        question: "Which handles attachments better?",
        answer:
          "Both can store files. HTV emphasizes attaching proof to devices; Airtable depends on how you build the base.",
      },
      {
        question: "What about pricing?",
        answer:
          "Airtable’s free tier and paid plans differ by collaboration and automation needs. HTV offers Free, Pro ($7.99), and Family ($14.99).",
      },
      {
        question: "Can I recreate HTV in Airtable?",
        answer:
          "Approximately, with enough design time. The question is whether you want to maintain that design.",
      },
      {
        question: "Who should not switch from Airtable?",
        answer:
          "Households with a working base tied into broader life-ops tables should think carefully before fragmenting systems.",
      },
    ],
    relatedSlugs: [
      "home-tech-vault-vs-notion",
      "home-tech-vault-vs-google-sheets",
      "best-home-inventory-software",
    ],
    ctaTitle: "Skip the base-building phase",
    ctaDescription:
      "Home Tech Vault gives you device and warranty structure without designing an Airtable schema.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "View features",
    secondaryCtaHref: MARKETING_ROUTES.features,
  },
  {
    slug: "home-tech-vault-vs-paper-records",
    path: pathFor("home-tech-vault-vs-paper-records"),
    kind: "versus",
    competitorName: "Paper records",
    title: `${HTV} vs Paper Records`,
    metaTitle: `${HTV} vs Paper Records — Home Tech Documentation`,
    metaDescription:
      "Compare keeping manuals and warranties on paper with a digital household vault — strengths of binders, risks in emergencies, and a practical hybrid approach.",
    keywords: [
      "paper warranty records",
      "digital vs paper home inventory",
      "Home Tech Vault vs paper",
    ],
    heroEyebrow: "Comparison",
    heroTitle: `${HTV} vs Paper Records`,
    heroDescription:
      "Binders still work. Digital vaults work when you need search, sharing, and a copy that does not live only in one drawer.",
    intro: [
      "Paper manuals, printed receipts, and a labeled binder are legitimate systems. They need no subscriptions and no passwords.",
      "They fail in predictable ways: water, moves, fires, and the moment you are standing in a store needing a serial that is at home.",
      "Home Tech Vault does not ban paper — it covers the gaps paper cannot: search, remote access, and household sharing.",
    ],
    whenAlternativeWins: [
      "You prefer tactile filing and already keep a disciplined binder.",
      "You want zero digital dependency for core proof.",
      "Your inventory is tiny and rarely changes.",
    ],
    whenHtvWins: [
      "You need access away from home during support or shopping.",
      "Multiple people should find the same records.",
      "You want photos, PDFs, and dates without growing a filing cabinet.",
    ],
    sections: [
      {
        id: "durability",
        heading: "Durability and disasters",
        paragraphs: [
          "Paper is durable against hard-drive failures and account lockouts. It is fragile against physical disasters and simple misfiling.",
          "A digital vault synced offsite helps after floods or theft — assuming you can still sign in.",
          "The resilient approach many households use: digitize proof, keep critical originals for items that legally need them.",
        ],
      },
      {
        id: "findability",
        heading: "Findability",
        paragraphs: [
          "Binders are only as good as their tabs. Search is human memory.",
          "Digital records let you find a TV serial or washer model in seconds.",
          "If your binder is pristine and small, paper remains rational.",
        ],
      },
      {
        id: "verdict",
        heading: "Practical verdict",
        paragraphs: [
          "Keep paper for preference or legal originals.",
          "Use Home Tech Vault so the household is not one drawer away from helplessness.",
          "Photograph serial labels even if you keep the box in the attic.",
        ],
      },
    ],
    table: {
      caption: "Home Tech Vault vs paper filing",
      columns: ["Criterion", HTV, "Paper records"],
      rows: [
        {
          feature: "Upfront cost",
          values: ["Free plan available", "Binder & printing costs"],
        },
        {
          feature: "Remote access",
          values: ["Yes", "No (unless you carry files)"],
        },
        {
          feature: "Search",
          values: ["Fast", "Manual"],
        },
        {
          feature: "Disaster resilience",
          values: [
            "Strong if account accessible offsite",
            "Weak in fire/flood unless duplicated",
          ],
        },
        {
          feature: "Sharing",
          values: ["Household roles", "Physical handoff"],
        },
        {
          feature: "Battery / login dependency",
          values: ["Yes", "No"],
        },
        {
          feature: "Best fit",
          values: [
            "Active digital households",
            "Small, stable paper-first homes",
          ],
        },
      ],
    },
    faq: [
      {
        question: "Should I throw away manuals?",
        answer:
          "Not required. Digitize what you need, recycle bulk manuals if the PDF exists, and keep paper for preference.",
      },
      {
        question: "Is digital safe enough for receipts?",
        answer:
          "For most consumer claims, clear scans plus account access are accepted. Keep originals when a lender or agency requires them.",
      },
      {
        question: "What is the fastest paper-to-digital step?",
        answer:
          "Photograph serial labels and save purchase emails into device records.",
      },
      {
        question: "Can paper and HTV coexist?",
        answer:
          "Yes. Many households keep a thin binder and treat HTV as the searchable index.",
      },
      {
        question: "What about privacy?",
        answer:
          "Digital systems need good account security. Paper needs physical control of the binder. Both are manageable with basic hygiene.",
      },
      {
        question: "Does HTV replace a fireproof box?",
        answer:
          "No. Critical legal documents may still belong in secure physical storage in addition to digital copies.",
      },
    ],
    relatedSlugs: [
      "home-tech-vault-vs-spreadsheet",
      "best-home-inventory-software",
      "best-warranty-tracker",
    ],
    ctaTitle: "Digitize the records you actually need",
    ctaDescription:
      "Start free in Home Tech Vault — keep paper where you want, search everywhere else.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Document organizer",
    secondaryCtaHref: "/home-document-organizer",
  },
  {
    slug: "best-home-inventory-software",
    path: pathFor("best-home-inventory-software"),
    kind: "best-of",
    competitorName: null,
    title: "Best Home Inventory Software",
    metaTitle: "Best Home Inventory Software — How to Choose (2026)",
    metaDescription:
      "An objective guide to choosing home inventory software: spreadsheets, Notion, Airtable, paper, and Home Tech Vault — with a comparison table and decision criteria.",
    keywords: [
      "best home inventory software",
      "home inventory app comparison",
      "device inventory software",
    ],
    heroEyebrow: "Buying guide",
    heroTitle: "Best Home Inventory Software",
    heroDescription:
      "“Best” depends on your household. This guide compares common approaches on structure, proof, sharing, and maintenance — not hype rankings.",
    intro: [
      "Home inventory tools range from paper binders to spreadsheets, Notion databases, Airtable bases, and purpose-built products like Home Tech Vault.",
      "The best choice is the one your household will still update in six months. Fancy features lose to honest maintenance.",
      "Below: criteria that matter, a comparison table, and when each option is the rational pick.",
    ],
    whenAlternativeWins: [
      "Spreadsheets/Sheets: simple solo lists and custom calculations.",
      "Notion/Airtable: you want a custom system and will maintain it.",
      "Paper: tiny inventories with strong filing habits and low remote-access need.",
    ],
    whenHtvWins: [
      "Home technology is the focus — devices, warranties, manuals, network notes.",
      "You want defaults instead of designing a database.",
      "Family sharing and claim-ready documents matter.",
    ],
    sections: [
      {
        id: "criteria",
        heading: "Criteria that actually matter",
        paragraphs: [
          "Capture: Can you store serials, rooms, photos, and receipts without gymnastics?",
          "Retrieve: Can another adult find a record during an outage or claim?",
          "Maintain: Will the system still be trustworthy after holiday gift season?",
          "Scope: Are you inventorying all possessions, or primarily home technology? Broader tools differ from tech-focused vaults.",
        ],
      },
      {
        id: "approaches",
        heading: "Common approaches",
        paragraphs: [
          "General productivity tools (Notion, Airtable, Sheets) optimize for flexibility. You pay in setup and schema care.",
          "Paper optimizes for simplicity and offline certainty. You pay in search and remote access.",
          "Home Tech Vault optimizes for household technology records. You pay by accepting an opinionated structure instead of a blank canvas.",
        ],
      },
      {
        id: "how-to-choose",
        heading: "How to choose in one afternoon",
        paragraphs: [
          "List five devices you care about most. Try recording serial, room, receipt, and warranty end date in your candidate tool.",
          "If that took a schema project, you are in platform territory. If it felt like filling a form, you are in product territory.",
          "Have a second person retrieve one record without coaching. That test predicts real-world success better than feature checklists.",
        ],
      },
      {
        id: "verdict",
        heading: "Balanced recommendation",
        paragraphs: [
          "For tech-heavy households that want less DIY, Home Tech Vault is a strong default.",
          "For builders and Workspace-centric families, Sheets, Notion, or Airtable remain credible — especially if already embedded.",
          "Ignore “best” badges that ignore your willingness to maintain the system.",
        ],
      },
    ],
    table: {
      caption: "Home inventory approaches compared",
      columns: [
        "Approach",
        "Setup effort",
        "Proof & files",
        "Sharing",
        "Best when",
      ],
      rows: [
        {
          feature: HTV,
          values: [
            "Low",
            "Strong (device-linked)",
            "Household roles",
            "Home tech is the job",
          ],
        },
        {
          feature: "Google Sheets / Excel",
          values: [
            "Low–medium",
            "Weak–medium (links)",
            "Familiar ACLs",
            "Simple lists & analysis",
          ],
        },
        {
          feature: "Notion",
          values: [
            "Medium–high",
            "Medium (DIY)",
            "Workspace permissions",
            "Life already runs in Notion",
          ],
        },
        {
          feature: "Airtable",
          values: [
            "High",
            "Strong if built well",
            "Base permissions",
            "You want a custom database",
          ],
        },
        {
          feature: "Paper binder",
          values: [
            "Low",
            "Physical originals",
            "In person",
            "Small, stable, offline-first",
          ],
        },
      ],
    },
    faq: [
      {
        question: "What is the best free home inventory software?",
        answer:
          "Spreadsheets and paper are free beyond time. Home Tech Vault’s Free plan covers getting started with device and document limits. “Best free” still depends on whether you need attachments and sharing.",
      },
      {
        question: "Do I need AI features?",
        answer:
          "Not to succeed. Reliable fields, documents, and habits matter more than novelty features.",
      },
      {
        question: "Should inventory include furniture and jewelry?",
        answer:
          "If your goal is insurance breadth, yes. If your goal is home technology ops, a tech-focused vault may be clearer — you can still note high-value non-tech items.",
      },
      {
        question: "How often should I update inventory software?",
        answer:
          "When something arrives, leaves, or changes rooms, plus a seasonal sweep.",
      },
      {
        question: "Is Home Tech Vault only for tech?",
        answer:
          "It is designed around home technology workflows. That focus is a strength for electronics-heavy homes and a limitation if you need a general estate inventory platform.",
      },
      {
        question: "What is a good evaluation test?",
        answer:
          "Document five devices end-to-end including one receipt photo, then have a partner find a serial without help.",
      },
    ],
    relatedSlugs: [
      "best-warranty-tracker",
      "home-tech-vault-vs-notion",
      "home-tech-vault-vs-google-sheets",
      "home-tech-vault-vs-airtable",
    ],
    ctaTitle: `See if ${HTV} fits your household`,
    ctaDescription:
      "Start free, inventory a few devices, and judge the tool by retrieval speed — not by a marketing score.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Home inventory overview",
    secondaryCtaHref: "/home-inventory-software",
  },
  {
    slug: "best-warranty-tracker",
    path: pathFor("best-warranty-tracker"),
    kind: "best-of",
    competitorName: null,
    title: "Best Warranty Tracker",
    metaTitle: "Best Warranty Tracker — How to Choose for Home Devices",
    metaDescription:
      "Objective guide to warranty trackers for home electronics: spreadsheets, calendar reminders, retailer portals, and Home Tech Vault — with a comparison table.",
    keywords: [
      "best warranty tracker",
      "warranty tracker app",
      "track device warranties",
    ],
    heroEyebrow: "Buying guide",
    heroTitle: "Best Warranty Tracker",
    heroDescription:
      "Warranty tracking fails when proof and dates live in different places. Compare approaches that keep coverage usable when something breaks.",
    intro: [
      "A warranty tracker is only as good as its proof: serial, receipt, coverage end date, and where to file a claim.",
      "Options include calendar alerts, spreadsheet columns, retailer/manufacturer portals, and inventory products that bind warranties to devices.",
      "This page ranks approaches by reliability under stress — not by feature count alone.",
    ],
    whenAlternativeWins: [
      "Calendar reminders: you own few items and always know where PDFs live.",
      "Retailer portals: most purchases are from one store with good history.",
      "Spreadsheets: you want custom columns and already attach Drive links carefully.",
    ],
    whenHtvWins: [
      "Devices, documents, and coverage dates should share one record.",
      "Multiple adults need access without sharing an email inbox.",
      "You track mixed brands, extended plans, and gift purchases.",
    ],
    sections: [
      {
        id: "what-good-looks-like",
        heading: "What good warranty tracking looks like",
        paragraphs: [
          "Each covered item has: identity (model/serial), proof of purchase, coverage layers (manufacturer, extended, card benefits), and an end date you trust.",
          "Reminders should fire early enough to decide renew-or-repair — without spamming you for trivial accessories.",
          "When you file a claim, you should not dig through three inboxes and a junk drawer.",
        ],
      },
      {
        id: "common-tools",
        heading: "Common tools and their failure modes",
        paragraphs: [
          "Calendar alerts fail when the event exists but the receipt does not.",
          "Manufacturer portals fail when you never registered, or registered under an old email.",
          "Spreadsheets fail when attachments drift. Home Tech Vault fails only if you never enter the device — same honesty requirement, less glue work.",
        ],
      },
      {
        id: "choosing",
        heading: "Choosing quickly",
        paragraphs: [
          "If warranties are occasional, a sheet plus calendar can be enough.",
          "If you manage many electronics across a household, bind warranties to device records in a vault.",
          "Test with your three most expensive devices before committing your whole archive.",
        ],
      },
      {
        id: "verdict",
        heading: "Balanced recommendation",
        paragraphs: [
          "For home electronics households, a device-linked tracker (such as Home Tech Vault) is usually stronger than dates alone.",
          "Single-store shoppers may lean on retailer history plus selective digitizing.",
          "The best tracker is the one that still has proof attached on the day something fails.",
        ],
      },
    ],
    table: {
      caption: "Warranty tracking approaches",
      columns: [
        "Approach",
        "Dates",
        "Proof",
        "Household access",
        "Watch-outs",
      ],
      rows: [
        {
          feature: HTV,
          values: [
            "Per-device coverage fields",
            "Attached to device",
            "Household sharing",
            "Requires entering devices",
          ],
        },
        {
          feature: "Spreadsheet + Drive",
          values: [
            "Custom columns",
            "Links (discipline required)",
            "Sheet sharing",
            "Link rot & column drift",
          ],
        },
        {
          feature: "Calendar reminders",
          values: [
            "Strong alerts",
            "Usually separate",
            "Calendar ACLs",
            "Alert without proof packet",
          ],
        },
        {
          feature: "Retailer / brand portals",
          values: [
            "Varies",
            "Order history helps",
            "Account login",
            "Fragmented across brands",
          ],
        },
        {
          feature: "Paper receipts",
          values: [
            "Handwritten/printed",
            "Originals on hand",
            "Physical only",
            "Fades, misfiles, no remote access",
          ],
        },
      ],
    },
    faq: [
      {
        question: "What is the best warranty tracker app?",
        answer:
          "The best app keeps dates and proof together. Home Tech Vault does that for home tech. Spreadsheets can too with strict habits. Calendars alone are rarely enough.",
      },
      {
        question: "Should I register every product?",
        answer:
          "Register high-value items when it helps support. Always keep proof of purchase regardless of registration.",
      },
      {
        question: "How early should reminders be?",
        answer:
          "30–60 days before expensive coverage ends is a practical window.",
      },
      {
        question: "Do credit card warranties count?",
        answer:
          "Often yes as an extra layer. Note them explicitly so you know which policy to call first.",
      },
      {
        question: "Can HTV track extended plans?",
        answer:
          "Yes — store plan numbers and end dates on the device alongside manufacturer coverage.",
      },
      {
        question: "What about appliances?",
        answer:
          "Treat them like any high-value device: model, serial, install date, and coverage documents on one record.",
      },
    ],
    relatedSlugs: [
      "best-home-inventory-software",
      "home-tech-vault-vs-google-sheets",
      "home-tech-vault-vs-paper-records",
    ],
    ctaTitle: "Track warranties next to the device",
    ctaDescription:
      "Home Tech Vault keeps coverage dates and proof on each record — start free.",
    primaryCtaLabel: "Start free",
    primaryCtaHref: MARKETING_ROUTES.signup,
    secondaryCtaLabel: "Warranty tracker",
    secondaryCtaHref: "/warranty-tracker",
  },
];

export function getAllComparisonPages(): ComparisonPage[] {
  return COMPARISON_PAGES;
}

export function getComparisonPage(
  slug: string
): ComparisonPage | null {
  return (
    COMPARISON_PAGES.find((page) => page.slug === slug) ?? null
  );
}

export function getRelatedComparisonPages(
  page: ComparisonPage
): ComparisonPage[] {
  return page.relatedSlugs
    .map((slug) => getComparisonPage(slug))
    .filter((item): item is ComparisonPage => item !== null);
}

export function listComparisonStaticParams() {
  return COMPARISON_PAGES.map((page) => ({ slug: page.slug }));
}

export function comparisonSitemapEntries(siteUrl: string) {
  return COMPARISON_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}