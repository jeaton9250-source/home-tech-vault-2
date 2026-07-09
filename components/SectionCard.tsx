type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      {children}
    </div>
  );
}