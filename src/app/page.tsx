import { redirect } from "next/navigation";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ estimateId?: string }>;
}) {
  // Landing page — if estimateId is provided, redirect to configurator
  // Otherwise show a simple landing page
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Box Sale Configurator
        </h1>
        <p className="text-muted-foreground mb-6">
          This application is launched from a NetSuite Estimate record.
          Please click the &quot;Configure Box Sale&quot; button on an Estimate
          to get started.
        </p>
        <p className="text-sm text-muted-foreground">
          If you arrived here by mistake, return to NetSuite and open an
          Estimate to begin configuring.
        </p>
      </div>
    </main>
  );
}
