export type HealthCheckCategory =
  | "devices"
  | "protection"
  | "network"
  | "recovery";

export type HealthCheckOption = {
  label: string;
  value: number;
};

export type HealthCheckQuestion = {
  id: string;
  category: HealthCheckCategory;
  question: string;
  description?: string;
  recommendation: string;
};

export const HEALTH_CHECK_OPTIONS: HealthCheckOption[] = [
  {
    label: "Yes",
    value: 10,
  },
  {
    label: "Somewhat",
    value: 5,
  },
  {
    label: "No",
    value: 0,
  },
];

export const HEALTH_CHECK_QUESTIONS: HealthCheckQuestion[] = [
  {
    id: "device_inventory",
    category: "devices",
    question:
      "Do you have a list of the technology in your home?",
    description:
      "Think TVs, computers, routers, smart-home equipment, speakers, cameras, appliances, and other important electronics.",
    recommendation:
      "Create one complete inventory of the important technology in your home.",
  },
  {
    id: "receipts",
    category: "protection",
    question:
      "Do you know where your important device receipts are?",
    recommendation:
      "Centralize your technology receipts so proof of purchase is easy to find.",
  },
  {
    id: "warranties",
    category: "protection",
    question:
      "Do you track when device warranties expire?",
    recommendation:
      "Record warranty expiration dates before coverage is forgotten or lost.",
  },
  {
    id: "serial_numbers",
    category: "devices",
    question:
      "Could you quickly find the model and serial number of an important device?",
    recommendation:
      "Record model and serial numbers for high-value and important devices.",
  },
  {
    id: "manuals",
    category: "protection",
    question:
      "Do you keep manuals and support documents organized?",
    recommendation:
      "Keep manuals, support documents, and warranty information attached to the devices they belong to.",
  },
  {
    id: "network_inventory",
    category: "network",
    question:
      "Do you know which devices are connected to your home network?",
    recommendation:
      "Build a clearer picture of the devices connected to your home network.",
  },
  {
    id: "router_credentials",
    category: "network",
    question:
      "Have you changed your router and Wi-Fi credentials from their defaults?",
    recommendation:
      "Review your router and Wi-Fi credentials and replace any manufacturer defaults.",
  },
  {
    id: "account_security",
    category: "network",
    question:
      "Do your important accounts use multi-factor authentication or similar protections?",
    recommendation:
      "Enable multi-factor authentication on important technology and cloud accounts where available.",
  },
  {
    id: "backups",
    category: "recovery",
    question:
      "Do you have backups for important digital information?",
    recommendation:
      "Create a dependable backup plan for information you could not easily replace.",
  },
  {
    id: "failure_readiness",
    category: "recovery",
    question:
      "If a major device failed today, could you quickly find what you need to repair, replace, or make a warranty claim?",
    recommendation:
      "Create a simple recovery record with receipts, warranty details, model information, and support documents.",
  },
];

export const HEALTH_CATEGORY_LABELS: Record<
  HealthCheckCategory,
  string
> = {
  devices: "Device Organization",
  protection: "Warranties & Documents",
  network: "Network & Security",
  recovery: "Backup & Recovery",
};
