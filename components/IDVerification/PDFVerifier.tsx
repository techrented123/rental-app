"use client";
import React, { useContext, useState } from "react";
import FileUpload from "./FileUpload";
import VerificationResult, { VerificationStatus } from "./VerificationResult";
import { PDFDocument } from "pdf-lib";
import { RentalApplicationContext } from "@/contexts/rental-application-context";

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
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const { updateRentApplicationStatus } = useContext(RentalApplicationContext);

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

      if (isValid) updateRentApplicationStatus(reportType !== "credit" ? 1 : 2);

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

  const handleReset = () => {
    setVerificationStatus("idle");
    setErrorMessage(null);
    setFileName(null);
    setMatchedKeywords([]);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden transition-all duration-300">
      <div className="px-6 sm:px-8">
        <p className="text-gray-500 mt-2 text-center text-md gap-1">
          If you do not have a Rented123 {reportType} report, you can get one{" "}
          <a
            href="https://rented123.com/sign-up/silver"
            target="_blank"
            className="underline"
          >
            here
          </a>
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {verificationStatus === "idle" || verificationStatus === "verifying" ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            isVerifying={isVerifying}
            fileName={fileName}
            reportType={reportType}
          />
        ) : (
          <VerificationResult
            status={verificationStatus}
            message={errorMessage}
            fileName={fileName}
            matchedKeywords={matchedKeywords}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default PDFVerifier;
