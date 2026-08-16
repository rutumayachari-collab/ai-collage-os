import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const EcosystemScene = lazy(() => import("./ecosystem-scene"));

function Fallback() {
  return (
    <div className="grid size-full place-items-center">
      <div className="bg-gradient-ai size-24 animate-pulse rounded-full opacity-60 blur-[2px]" />
    </div>
  );
}

export function EcosystemCanvas() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <EcosystemScene />
      </Suspense>
    </ClientOnly>
  );
}
