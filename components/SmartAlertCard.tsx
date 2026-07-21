import Alert from "@/components/ui/Alert";

type SmartAlertCardProps = {
  title: string;
  description: string;
  tone?: "warning" | "success" | "info";
};

export default function SmartAlertCard({
  title,
  description,
  tone = "info",
}: SmartAlertCardProps) {
  return (
    <Alert variant={tone} title={title}>
      {description}
    </Alert>
  );
}
