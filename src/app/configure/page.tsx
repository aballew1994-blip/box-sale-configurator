import { Suspense } from "react";
import { ConfigureContent } from "./ConfigureContent";

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading configurator...</p>
          </div>
        </div>
      }
    >
      <ConfigureContent />
    </Suspense>
  );
}
