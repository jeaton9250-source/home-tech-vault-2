type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}