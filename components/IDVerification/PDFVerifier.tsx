"use client";
import React, { useState } from "react";
import FileUpload from "./FileUpload";
import VerificationResult, { VerificationStatus } from "./VerificationResult";
import { PDFDocument } from "pdf-lib";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { ExternalLink } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";

const PDFVerifier = ({
  reportType,
  verificationParams: { keywordsLength, title: expectedTitles },
}: {
  reportType: string;
  verificationParams: { keywordsLength: number; title: string[] };
}) => {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { updateRentApplicationStatus, updateStepOutput } =
    useRentalApplicationContext();

  const verifyPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    const title = pdf.getTitle() || "";
    const author = pdf.getAuthor() || "";
    const keywords = (pdf.getKeywords() || "").split(" ");

    if (
      !expectedTitles.includes(title) ||
      author !== "Rented123" ||
      keywords.length !== keywordsLength
    ) {
      return { isValid: false, message: "Invalid document" };
    }

    return { isValid: true, message: "Valid Document" };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setIsVerifying(true);
    setVerificationStatus("verifying");
    try {
      const { isValid, message } = await verifyPDF(file);
      if (isValid) {
        const b64 = await fileToBase64(file);
        updateStepOutput(b64);
        updateRentApplicationStatus(reportType !== "credit" ? 2 : 3);
      }
      // Simulate a delay to show the loading state
      setTimeout(() => {
        setVerificationStatus(isValid ? "success" : "error");
        setErrorMessage(message);

        setIsVerifying(false);
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        setVerificationStatus("error");
        setErrorMessage("Failed to process PDF. Please try again.");
        setIsVerifying(false);
      }, 1500);
    }
  };

  const handleReset = React.useCallback(() => {
    setVerificationStatus("idle");
    setErrorMessage(null);
    setFileName(null);
  }, []);

  React.useEffect(() => {
    handleReset();
  }, [reportType]);

  return (
    <div className="bg-white rounded-xl !h-[400px] overflow-hidden transition-all duration-300 mt-4">
      <div
        className={`px-6 md:py-6 sm:px-8 py-3
        `}
      >
        {verificationStatus === "idle" || verificationStatus === "verifying" ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            isVerifying={isVerifying}
            fileName={fileName}
            reportType={reportType}
          />
        ) : (
          <VerificationResult
            title={
              verificationStatus === "success"
                ? "Verification Successful"
                : "Verification Failed"
            }
            subtitle={errorMessage}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </div>
      <div className="px-6 sm:px-8">
        <p className="text-gray-700 mt-2 text-center text-sm font-medium gap-1 flex items-center justify-center">
          <a
            href="https://rented123.com/sign-up/silver"
            target="_blank"
            className="underline text-gray-550"
          >
            I do not have a Rented123 {reportType} report{" "}
          </a>{" "}
          <ExternalLink size={16} />
        </p>
      </div>
    </div>
  );
};

export default PDFVerifier;
