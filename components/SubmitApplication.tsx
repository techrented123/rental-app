"use client";
import {
  generateApplicationFormPDF,
  generateBackgroundCheckPDF,
} from "@/lib/pdfService";
import { base64ToFile } from "@/lib/utils";
import React from "react";
import { CircleCheck, RotateCcw } from "lucide-react";

const SubmitApplication = () => {
  const [finalOutput, setFinalOutput] = React.useState<Array<any>>([]);

  function sendApplication() {}

  const recoverBlobs = React.useCallback((stepOutputs: any) => {
    const output = stepOutputs
      .filter(Boolean)
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
    setFinalOutput(output);
  }, []);

  console.log({ finalOutput });

  React.useEffect(() => {
    const savedStepOutputs = localStorage.getItem("step_outputs");
    if (savedStepOutputs) {
      recoverBlobs(JSON.parse(savedStepOutputs));
    }
  }, [recoverBlobs]);

  return (
    <div className="flex flex-col justify-center gap-10">
      <h6 className="text-lg font-medium text-gray-700 ">Application Review</h6>
      <div className="w-3/4 ">
        <ul className="bg-gray-100 p-4 rounded space-y-3 ">
          {finalOutput.map((item, index) => {
            return (
              <li key={index} className="flex items-center gap-2">
                <CircleCheck className="text-green-500" />
                <span>
                  {item.name
                    ? item.name
                    : index === 2
                    ? "Background Check Result"
                    : "Application Form"}
                </span>
              </li>
            );
          })}
          <li className="flex items-center gap-2">
            <CircleCheck className="text-green-500" />
            Documents Signed (Sent to Email)
          </li>
        </ul>
        <div className="flex mt-9 justify-between">
          <button
            onClick={sendApplication}
            className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Restart Application
          </button>
          <button
            onClick={sendApplication}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Submit Entire Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitApplication;
