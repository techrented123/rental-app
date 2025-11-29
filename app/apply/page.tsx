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
  const { sessionId, updateRentApplicationStatus, updateRentalInfo, restoreState } =
    useRentalApplicationContext();
  const hasFetchedFromDB = React.useRef(false);

  // Check for resume parameter
  const shouldResume = searchParams.get("resume") === "true";
  const resumeSessionId = searchParams.get("sessionId");
  const urlSlug = searchParams.get("slug"); // Get slug from URL (first parameter)

  React.useEffect(() => {
    const last_step = localStorage.getItem("last_saved_step");
    const rentalInfo = localStorage.getItem("rental_and_applicant_info");

    // PRIORITY 1: Use localStorage step if available
    let currentStep = 0;
    if (last_step) {
      currentStep = JSON.parse(last_step);
      setLastSavedStep(currentStep);
      // Update application status without tracking (restoring state)
      updateRentApplicationStatus(currentStep, false);
    }

    // Use slug from URL if present (from resume link), otherwise use localStorage
    if (urlSlug) {
      setSlug(urlSlug);
      // Update rentalInfo with slug from URL if not already set
      if (rentalInfo) {
        const parsedRentalInfo = JSON.parse(rentalInfo);
        if (parsedRentalInfo.slug !== urlSlug) {
          updateRentalInfo({ slug: urlSlug });
        }
      } else {
        updateRentalInfo({ slug: urlSlug });
      }
    } else if (rentalInfo) {
      const parsedRentalInfo = JSON.parse(rentalInfo);
      setSlug(parsedRentalInfo.slug || "");
    }

    // Fetch from DynamoDB to ensure we have the latest state
    // This runs in parallel with localStorage initialization to handle cross-device/browser resume
    if (sessionId && !hasFetchedFromDB.current) {
      hasFetchedFromDB.current = true;
      fetch(`/api/track-application?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.trackingData) {
            const serverStep = data.trackingData.step || 0;
            console.log("Fetched tracking data from DynamoDB:", data.trackingData);
            
            // If server has a step, use it (it's the source of truth)
            if (serverStep > 0) {
              // Construct stepOutputs from server data
              const newStepOutputs: any[] = [true]; // Step 0 is always true
              
              // Step 1: Verification Report
              // We add a placeholder if URL exists, but we can't fully reconstruct the file object
              // ApplicationForm handles missing stepOutputs[1] gracefully now
              if (data.trackingData.verification_report_url) {
                 newStepOutputs[1] = { 
                   restoredFromServer: true, 
                   url: data.trackingData.verification_report_url 
                 };
              } else {
                 newStepOutputs[1] = undefined;
              }

              // Step 2: Application Form Data
              if (data.trackingData.data) {
                newStepOutputs[2] = data.trackingData.data;
              }

              // Restore state
              restoreState(
                newStepOutputs, 
                data.trackingData.rentalInfo || (data.trackingData.property ? { slug: data.trackingData.property } : null),
                serverStep
              );
            }
          }
        })
        .catch((err) => console.error("Error fetching tracking data:", err));
    }

    // Handle resume from email link (Legacy/Fallback logic)
    if (shouldResume && resumeSessionId && !sessionId) {
        // logic handled by main fetch above once sessionId is set
    }
  }, [
    sessionId,
    shouldResume,
    resumeSessionId,
    updateRentApplicationStatus,
    urlSlug,
    updateRentalInfo,
  ]);

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
