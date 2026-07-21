type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-text-primary">{title}</h1>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}