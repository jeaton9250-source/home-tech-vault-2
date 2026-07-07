type TechnologyScoreCardProps = {
  score: number;
};

export default function TechnologyScoreCard({ score }: TechnologyScoreCardProps) {
  const label =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Improvement";

  return (
    <div className="bg-blue-950 text-white rounded-3xl shadow p-6">
      <p className="text-blue-200">Technology Score</p>

      <div className="flex items-end gap-2 mt-4">
        <h2 className="text-5xl font-bold">{score}</h2>
        <p className="text-blue-200 mb-2">/100</p>
      </div>

      <div className="w-full bg-blue-900 rounded-full h-3 mt-5">
        <div
          className="bg-white h-3 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-4 font-semibold">{label}</p>

      <p className="text-blue-200 text-sm mt-1">
        Complete your device information to improve your score.
      </p>
    </div>
  );
}