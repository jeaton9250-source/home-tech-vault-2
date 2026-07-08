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
  const styles = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    success: "bg-green-50 border-green-200 text-green-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  return (
    <div className={`border rounded-2xl p-5 ${styles[tone]}`}>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm mt-2">{description}</p>
    </div>
  );
}