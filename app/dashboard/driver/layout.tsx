
'use client';

export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex justify-center items-start pt-8">
      <div className="w-full max-w-xs rounded-3xl bg-card text-card-foreground p-4 shadow-2xl overflow-hidden border">
        {children}
      </div>
    </div>
  );
}
