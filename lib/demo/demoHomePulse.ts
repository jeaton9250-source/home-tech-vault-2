import type { HomeHealthHighlight } from "@/lib/home-health/types";

export const demoHomePulseHighlights: HomeHealthHighlight[] = [
  {
    id: "demo-highlight-tv-warranty",
    tone: "warning",
    message: "Samsung Frame TV warranty expires in 28 days.",
  },
  {
    id: "demo-highlight-washer-manual",
    tone: "positive",
    message: "LG Washer manual was added yesterday.",
  },
  {
    id: "demo-highlight-ring-firmware",
    tone: "warning",
    message: "Ring Doorbell firmware update available.",
  },
  {
    id: "demo-highlight-insurance-report",
    tone: "positive",
    message: "Last insurance report generated 2 weeks ago.",
  },
  {
    id: "demo-highlight-backup",
    tone: "positive",
    message: "All important documents are backed up.",
  },
];
