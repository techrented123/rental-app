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
import { RentalApplicationProvider } from "@/contexts/rental-application-context";
import ApplicationForm from "@/components/ApplicationForm";

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
    title: "Documents",
    description: "Verification process",
    icon: CheckCircle,
  },
  {
    title: "Payment",
    description: "Application fee",
    icon: CreditCard,
  },
];

export default function Home() {
  const params = useSearchParams();
  const slug = params.get("slug") || "";

  return (
    <div className="mt-4 ml-4">
      <div className="p-2 hover:bg-slate-300 w-[40px] h-[40px] rounded-full border-b">
        <Link href={`/?slug=${slug}`} className="">
          <ChevronLeft />
        </Link>
      </div>
      <RentalApplicationProvider>
        <FormStepper steps={steps} />
      </RentalApplicationProvider>
    </div>
  );
}
