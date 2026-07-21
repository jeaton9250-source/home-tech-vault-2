import type {
  HomeHealthStatus,
  HomeHealthStatusLabel,
} from "@/lib/home-health/types";

export function getHomeHealthStatus(
  score: number
): HomeHealthStatus {
  if (score >= 95) {
    return {
      label: "Excellent",
      message: "Everything looks great.",
    };
  }

  if (score >= 80) {
    return {
      label: "Healthy",
      message: "Everything looks great.",
    };
  }

  if (score >= 60) {
    return {
      label: "Needs Attention",
      message: "A few things could be improved.",
    };
  }

  return {
    label: "Needs Setup",
    message:
      "Your Home Tech Vault is just getting started.",
  };
}

export function isHomeHealthStatusLabel(
  value: string
): value is HomeHealthStatusLabel {
  return (
    value === "Excellent" ||
    value === "Healthy" ||
    value === "Needs Attention" ||
    value === "Needs Setup"
  );
}
