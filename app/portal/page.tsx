import { Suspense } from "react";
import { PortalClient } from "./portal-client";

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 md:px-10 py-24 flex justify-center">
          <p className="text-stone-500 text-sm">Opening the portal…</p>
        </div>
      }
    >
      <PortalClient />
    </Suspense>
  );
}
