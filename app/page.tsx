import PropertyListing from "@/components/property-listing";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<p>Loading query params…</p>}>
      <div className="!overflow-y-auto h-screen">
        <PropertyListing />
      </div>
    </Suspense>
  );
}
