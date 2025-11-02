"use client";
import * as React from "react";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import FormStepper from "@/components/ui/stepper";
import { Crown, FileCheck, FileText, PenTool, CreditCard } from "lucide-react";
import Plans from "@/components/membership-plans";
import PDFVerifier from "@/components/CompleteVerification/PDFVerifier";
import ApplicationForm from "@/components/ApplicationForm";
import { RentalAgreement } from "@/components/Documents/RentalAgreement";
import SubmitApplication from "@/components/SubmitApplication";
import AlertDialogBox from "@/components/ui/alert-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { getTrackingDataFromCookie } from "@/lib/tracking";

const steps = [
  {
    title: "Membership Plans",
    description: "Optional",
    icon: Crown,
    content: <Plans />,
  },
  {
    title: "Verification Report",
    icon: FileCheck,
    content: <PDFVerifier />,
  },
  {
    title: "Application Form",
    icon: FileText,
    content: <ApplicationForm />,
  },
  {
    title: "Signatures",
    icon: PenTool,
    content: <RentalAgreement />,
  },
  {
    title: "Confirmation",
    description: "Deposit Reminder",
    icon: CreditCard,
    content: <SubmitApplication />,
  },
];

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug, setSlug] = React.useState("");
  const [lastSavedStep, setLastSavedStep] = React.useState(0);
  const { sessionId, updateRentApplicationStatus } =
    useRentalApplicationContext();

  // Check for resume parameter
  const shouldResume = searchParams.get("resume") === "true";
  const resumeSessionId = searchParams.get("sessionId");

  React.useEffect(() => {
    const last_step = localStorage.getItem("last_saved_step");
    const rentalInfo = localStorage.getItem("rental_and_applicant_info");
    if (last_step) {
      setLastSavedStep(JSON.parse(last_step));
    }
    if (rentalInfo) {
      const parsedRentalInfo = JSON.parse(rentalInfo);
      setSlug(parsedRentalInfo.slug);
    }

    // Track initial page load
    if (sessionId) {
      const rentalInfo = localStorage.getItem("rental_and_applicant_info");
      const rentalData = rentalInfo ? JSON.parse(rentalInfo) : {};

      fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: lastSavedStep || 0,
          address: rentalData.address,
          property: rentalData.slug || rentalData.property,
        }),
      }).catch(console.error);
    }

    // Handle resume from email link
    if (shouldResume && resumeSessionId) {
      // Fetch tracking data from DynamoDB via API
      fetch(`/api/track?sessionId=${resumeSessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.trackingData) {
            const step = data.trackingData.step || 0;
            setLastSavedStep(step);
            updateRentApplicationStatus(step);
          } else {
            // Fallback to cookie if API doesn't have data
            const trackingData = getTrackingDataFromCookie();
            if (trackingData?.step !== undefined) {
              setLastSavedStep(trackingData.step);
              updateRentApplicationStatus(trackingData.step);
            }
          }
        })
        .catch(console.error);
    }
  }, [sessionId, shouldResume, resumeSessionId, updateRentApplicationStatus]);

  const handleClick = () => {
    router.push(`/?slug=${slug}`);
  };

  return (
    <div className="md:mt-3 flex-col md:flex justify-start h-screen items-start gap-4 md:gap-0">
      <AlertDialogBox
        title={"Your progress will be saved"}
        description="No need to worry. Your progress will be saved and you can continue from where you left off"
        proceedBtnText="Continue"
        onProceed={handleClick}
      >
        <Button className="md:bg-blue-500 p-2 md:hover:bg-blue-400 md:hover:text-white ml-2.5 w-[40px] h-[40px] rounded-full">
          <ChevronLeft />
        </Button>
      </AlertDialogBox>

      <FormStepper steps={steps} lastSavedStep={lastSavedStep} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <ApplyPageContent />
    </Suspense>
  );
}
