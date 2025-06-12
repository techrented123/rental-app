"use client";
import {
  generateApplicationFormPDF,
  generateBackgroundCheckPDF,
  mergePdfs,
} from "@/lib/pdfService";
import { base64ToFile } from "@/lib/utils";
import React from "react";
import { CircleCheck, SendHorizontal } from "lucide-react";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import RestartApplication from "./RestartApplication";
import { ApplicationFormInfo, BackgroundCheckResult } from "@/types";
import { useRouter } from "next/navigation";

type FinalOutput = Array<ApplicationFormInfo | BackgroundCheckResult | string>;

const SubmitApplication = () => {
  const [mergedPDF, setMergedPDF] = React.useState("");
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const { rentalInfo, stepOutputs, restartApplication } =
    useRentalApplicationContext();
  const { landlordEmail, landlordName, slug } = rentalInfo;

  async function sendApplication() {
    setLoading(true);
    const body = {
      mergedPDF,
      landlordEmail,
      landlordName,
    };
    try {
      const response = await fetch("/api/submit", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body }),
      });
      const data = await response.json();

      setIsEmailSent(true);
      restartApplication();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const recoverBlobs = React.useCallback(async (stepOutputs: FinalOutput) => {
    const filteredOutput = stepOutputs
      .filter((step) => typeof step !== "boolean")
      .map(
        (
          step: string | BackgroundCheckResult | ApplicationFormInfo,
          index: number
        ) => {
          if (typeof step === "string") {
            return base64ToFile(
              step,
              index === 0 ? "ID Verification" : "Credit Report",
              "application/pdf"
            );
          }
          return index === 2
            ? generateBackgroundCheckPDF(step as BackgroundCheckResult)
            : generateApplicationFormPDF(step as ApplicationFormInfo);
        }
      );
    const mergedBlob = await mergePdfs(
      filteredOutput as [File, File, Blob, Blob],
      rentalInfo
    );
    const arrayBuffer = await mergedBlob.arrayBuffer();
    const base64PDF = Buffer.from(arrayBuffer).toString("base64");
    setMergedPDF(base64PDF);
  }, []);

  React.useEffect(() => {
    recoverBlobs(stepOutputs);
  }, [stepOutputs]);

  return (
    <div className="flex flex-col  gap-10 h-[450px]">
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
            <div
              className={`flex flex-col-reverse md:flex-row mt-9 justify-center items-center md:justify-between gap-2`}
            >
              <RestartApplication disable={loading} />
              <button
                onClick={() => sendApplication()}
                className="flex gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    Submit Entire Application
                    <SendHorizontal />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 md:mt-40 flex flex-col items-center justify-center text-green-500 ">
            <p>Application successfully submitted. We will be in touch. </p>
            <p>Kindly send the rent deposit to {rentalInfo.landlordEmail}</p>
            <p>You can now close the application.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitApplication;
