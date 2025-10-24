"use client";
import React, { useState } from "react";
import FileUpload from "./FileUpload";
import VerificationResult, { VerificationStatus } from "./VerificationResult";
import { PDFDocument } from "pdf-lib";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { ExternalLink } from "lucide-react";
import { fileToBase64, storeFileInIndexedDB } from "@/lib/utils";

const PDFVerifier = () => {
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
    const keywords = pdf.getKeywords() || "";
    const subject = pdf.getSubject() || "";
    const expectedTitle = process.env.NEXT_PUBLIC_TITLE;
    const expectedAuthor = process.env.NEXT_PUBLIC_AUTHOR;
    const expectedKeywords = process.env.NEXT_PUBLIC_KEYWORDS;
    console.log({ title, author, keywords, subject });
    console.log({ expectedTitle, expectedAuthor, expectedKeywords });
    if (
      title === expectedTitle &&
      author === expectedAuthor &&
      keywords === expectedKeywords
    ) {
      return { isValid: true, message: "Valid Document", subject };
    }

    return { isValid: false, message: "Invalid document" };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setIsVerifying(true);
    setVerificationStatus("verifying");
    try {
      const { isValid, message, subject } = await verifyPDF(file);
      if (isValid) {
        try {
          const fileKey = `pdf_verification_${Date.now()}`;
          await storeFileInIndexedDB(file, fileKey);
          updateStepOutput({ key: fileKey, fileName: file.name, subject });
          updateRentApplicationStatus(2);
        } catch (base64Error) {
          console.error("Error converting file to base64:", base64Error);
          throw base64Error; // Re-throw to trigger the outer catch
        }
      }
      // Simulate a delay to show the loading state
      setTimeout(() => {
        setVerificationStatus(isValid ? "success" : "error");
        setErrorMessage(message);

        setIsVerifying(false);
      }, 1500);
      console.log({ isValid, message });
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
  }, []);

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
      <div className="px-6 sm:px-8 ">
        <p className="text-gray-700 mt-2 text-center text-sm font-medium gap-1 flex items-center justify-center">
          <a
            href={"https://rented123.com/product/complete-verification/"}
            target="_blank"
            className="underline text-gray-550"
          >
            I do not have a Rented123 Complete 3-in-1 Verification report{" "}
          </a>{" "}
          <ExternalLink size={16} />
        </p>
      </div>
    </div>
  );
};

export default PDFVerifier;
