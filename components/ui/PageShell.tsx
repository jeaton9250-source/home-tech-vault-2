type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[#F6F7F9] p-8">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}