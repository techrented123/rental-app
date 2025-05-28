import PropertyListing from "@/components/property-listing";
import { RentalApplicationProvider } from "@/contexts/rental-application-context";

export default function Home() {
  return (
    <div className="!overflow-y-auto h-screen">
      <PropertyListing />
    </div>
  );
}
