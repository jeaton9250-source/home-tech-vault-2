type RecommendationCardProps = {
  title: string;
  description: string;
};

export default function RecommendationCard({
  title,
  description,
}: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
      <h3 className="font-bold text-text-primary">{title}</h3>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  );
}