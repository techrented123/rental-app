"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import FormStepper from "@/components/ui/stepper";
import Link from "next/link";
import {
  UserCircle,
  Building2,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import Plans from "@/components/membership-plans";
import PDFVerifier from "@/components/IDVerification/PDFVerifier";
import BackgroundCheck from "@/components/BackgroundCheck";
import ApplicationForm from "@/components/ApplicationForm";
import { RentalAgreement } from "@/components/Documents/RentalAgreement";
import SubmitApplication from "@/components/SubmitApplication";

const steps = [
  {
    title: "Membership Plans",
    description: "Optional",
    icon: UserCircle,
    content: <Plans />,
  },
  {
    title: "ID Verification",
    icon: Building2,
    content: (
      <PDFVerifier
        reportType="ID verification"
        verificationParams={{
          title: ["ID Verification Result"],
          keywordsLength: 3,
        }}
      />
    ),
  },
  {
    title: "Credit Check",
    icon: DollarSign,
    content: (
      <PDFVerifier
        reportType="credit"
        verificationParams={{
          title: ["Basic Credit Report", "Full Credit Report"],
          keywordsLength: 2,
        }}
      />
    ),
  },
  {
    title: "Background Check",
    icon: Users,
    content: <BackgroundCheck />,
  },
  {
    title: "Application Form",
    icon: FileText,
    content: <ApplicationForm />,
  },
  {
    title: "Signatures",
    icon: CheckCircle,
    content: <RentalAgreement />,
  },
  {
    title: "Confirmation",
    description: "Deposit Reminder",
    icon: CreditCard,
    content: <SubmitApplication />,
  },
];

export default function Home() {
  const params = useSearchParams();
  const slug = params.get("slug") || "";
  const [lastSavedStep, setLastSavedStep] = React.useState(0);

  React.useEffect(() => {
    const last_step = localStorage.getItem("last_saved_step");
    if (last_step) {
      setLastSavedStep(JSON.parse(last_step) + 1);
    }
  }, []);

  return (
    <div className=" mt-4 ml-4 h-screen">
      <div className="p-2 hover:bg-slate-300 w-[40px] h-[40px] rounded-full border-b">
        <Link href={`/?slug=${slug}`} className="">
          <ChevronLeft />
        </Link>
      </div>
      <FormStepper steps={steps} lastSavedStep={lastSavedStep} />
    </div>
  );
}
