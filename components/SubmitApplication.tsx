"use client";
import {
  generateApplicationFormPDF,
  generateBackgroundCheckPDF,
  mergePdfs,
} from "@/lib/pdfService";
import { base64ToFile } from "@/lib/utils";
import React from "react";
import { CircleCheck, RotateCcw, SendHorizontal } from "lucide-react";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";

const SubmitApplication = () => {
  const [mergedPDF, setMergedPDF] = React.useState("");
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { clearStepOutputs, rentalInfo, stepOutputs } =
    useRentalApplicationContext();
  async function sendApplication() {
    setLoading(true);
    const body = {
      mergedPDF,
      landlordEmail: rentalInfo.landlordEmail,
      landlordName: rentalInfo.landlordName,
    };
    try {
      const response = await fetch("/api/submit", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body }),
      });
      const data = await response.json();
      setIsEmailSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const recoverBlobs = React.useCallback(async (stepOutputs: any[]) => {
    const filteredOutput = stepOutputs
      .filter((step) => typeof step !== "boolean")
      .map((step: any, index: number) => {
        if (typeof step === "string") {
          return base64ToFile(
            step,
            index === 0 ? "ID Verification" : "Credit Report",
            "application/pdf"
          );
        }
        return index === 2
          ? generateBackgroundCheckPDF(step)
          : generateApplicationFormPDF(step);
      });
    console.log({ filteredOutput });
    const mergedBlob = await mergePdfs(filteredOutput, rentalInfo);
    const arrayBuffer = await mergedBlob.arrayBuffer();
    const base64PDF = Buffer.from(arrayBuffer).toString("base64");
    setMergedPDF(base64PDF);
  }, []);

  console.log({ mergedPDF });

  React.useEffect(() => {
    recoverBlobs(stepOutputs);
  }, [stepOutputs]);

  return (
    <div className="flex flex-col justify-center gap-10">
      <h6 className="text-lg font-medium text-gray-700 ">Application Review</h6>
      <div className="w-full">
        {!isEmailSent ? (
          <div>
            <ul className=" shadow-md p-4 rounded space-y-3 ">
              <li className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                ID Verfication
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                Credit Check Report
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                AI Background Check
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                Application Form
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                Documents Signed (Sent to Email)
              </li>
            </ul>
            <div className="flex flex-col-reverse md:flex-row mt-9 justify-center items-center md:justify-between gap-2">
              <button
                onClick={() => {
                  clearStepOutputs();
                }}
                className="flex gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <RotateCcw /> Restart Application
              </button>
              <button
                onClick={() => sendApplication()}
                className="flex gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit Entire Application
                <SendHorizontal />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-40 flex flex-col items-center justify-center ">
            <p>Application successfully submitted. We will be in touch. </p>
            <p>Kindly send deposit to {rentalInfo.landlordEmail}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitApplication;
