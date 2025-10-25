"use client";
import React, { useState } from "react";
import FileUpload from "./FileUpload";
import VerificationResult, { VerificationStatus } from "./VerificationResult";
import { PDFDocument } from "pdf-lib";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { ExternalLink, AlertCircle } from "lucide-react";
import { storeFileInIndexedDB } from "@/lib/utils";

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Document Verification
        </h3>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Upload your Complete 3-in-1 Verification Report to proceed with your
          application
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Help Section - Only show when verification is not successful */}
        {verificationStatus !== "success" && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
            <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 hidden sm:block" />
            <p className="text-gray-600 text-sm">
              Don't have a verification report?{" "}
              <a
                href="https://rented123.com/product/complete-verification/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium inline-flex items-center gap-1"
              >
                Get one here
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        )}
        <div className="p-4 pt-1 sm:p-6 ">
          {verificationStatus === "idle" ||
          verificationStatus === "verifying" ? (
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
      </div>
    </div>
  );
};

export default PDFVerifier;
