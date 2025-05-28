"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import FormStepper from "@/components/ui/stepper2";
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
import RentalAgreement from "@/components/Documents/RentalAgreement";
import { RentalAgreement2 } from "@/components/Documents/RentalAgreement2";

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
    icon: CheckCircle,
    content: (
      <RentalAgreement2
        signerEmail="tambi@rented123.com"
        signerName="Tambi"
        fileUrl="https://rented123-brand-files.s3.us-west-2.amazonaws.com/rental-lease-documents/Alberta+Residential+tenancy+form.pdf"
      />
    ),
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
    <div className=" mt-4 ml-4 h-screen">
      <div className="p-2 hover:bg-slate-300 w-[40px] h-[40px] rounded-full border-b">
        <Link href={`/?slug=${slug}`} className="">
          <ChevronLeft />
        </Link>
      </div>
      <FormStepper steps={steps} />
    </div>
  );
}
