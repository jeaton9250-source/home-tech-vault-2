type StatCardProps = {
  title: string;
  value: string;
  description?: string;
};

export default function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-4xl font-bold mt-2 text-blue-950">{value}</h2>
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}