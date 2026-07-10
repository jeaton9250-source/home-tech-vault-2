type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[32px] border border-[#E8E2D6] bg-white/90 p-6 shadow-[0_18px_50px_rgba(17,24,39,0.06)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}