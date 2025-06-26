import PropertyListing from "@/components/property-listing";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={''}>
      <div className="!overflow-y-auto h-screen">
        <PropertyListing />
      </div>
    </Suspense>
  );
}
