"use client";
import { generateApplicationFormPDF } from "@/lib/pdfService";
import { getFileFromIndexedDB } from "@/lib/utils";
import React from "react";
import {
  CircleCheck,
  SendHorizontal,
  CheckCircle2,
  FileText,
  Shield,
  Clock,
} from "lucide-react";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import RestartApplication from "./RestartApplication";
import { ApplicationFormInfo } from "@/types";
import { clearTrackingCookies } from "@/lib/tracking";

type FinalOutput = Array<ApplicationFormInfo | string>;

const SubmitApplication = () => {
  const [pdfs, setPdfs] = React.useState<{
    applicationForm: string | null;
    verificationReport: string | null;
  }>({
    applicationForm: null,
    verificationReport: null,
  });
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { rentalInfo, stepOutputs, restartApplication, sessionId } =
    useRentalApplicationContext();
  const { landlordEmail, landlordName, slug } = rentalInfo;

  async function sendApplication() {
    setLoading(true);
    const body = {
      landlordEmail,
      landlordName,
      applicationFormPDF: pdfs.applicationForm,
      verificationReportPDF: pdfs.verificationReport,
    };
    try {
      const response = await fetch("/api/submit", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body }),
      });
      const data = await response.json();

      // Clear tracking data when application is completed
      if (sessionId) {
        try {
          await fetch("/api/track/clear", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });
        } catch (error) {
          console.error("Error clearing tracking data:", error);
        }
        clearTrackingCookies();
      }

      setIsEmailSent(true);
      await restartApplication();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const recoverBlobs = React.useCallback(async (stepOutputs: FinalOutput) => {
    if (stepOutputs.length === 0) {
      return;
    }
    try {
      // Check if we have the application form data at index 2
      if (!stepOutputs[2]) {
        console.error("Application form data not found at stepOutputs[2]");
        return;
      }

      // Generate application form PDF
      const applicationFormPDF = generateApplicationFormPDF(
        stepOutputs[2] as ApplicationFormInfo
      );

      // Convert application form PDF to base64
      const appFormArrayBuffer = await applicationFormPDF.arrayBuffer();
      const appFormBase64 = Buffer.from(appFormArrayBuffer).toString("base64");

      // Get verification report from IndexedDB (stepOutputs[1] contains the file key)
      const verificationStep = stepOutputs[1];
      let verificationBase64 = null;

      if (
        verificationStep &&
        typeof verificationStep === "object" &&
        "key" in verificationStep
      ) {
        const verificationFileKey = (verificationStep as any).key;
        // Retrieve file from IndexedDB and convert to base64
        const verificationFile = await getFileFromIndexedDB(
          verificationFileKey
        );
        if (verificationFile) {
          const verificationArrayBuffer = await verificationFile.arrayBuffer();
          verificationBase64 = Buffer.from(verificationArrayBuffer).toString(
            "base64"
          );
        }
      }

      // Store both PDFs for email sending
      setPdfs({
        applicationForm: appFormBase64,
        verificationReport: verificationBase64,
      });

      console.log("Both PDFs prepared for email");
    } catch (error) {
      console.error("Error preparing PDFs:", error);
    }
  }, []);

  React.useEffect(() => {
    recoverBlobs(stepOutputs);
  }, [stepOutputs, recoverBlobs]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Application Review
        </h1>
        <p className="text-gray-600">
          Review your application details before final submission
        </p>
      </div>

      <div className="w-full">
        {!isEmailSent ? (
          <div className="space-y-8">
            {/* Progress Checklist */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Application Checklist
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">
                      Identity Verification
                    </p>
                    <p className="text-sm text-green-600">
                      Document verification completed successfully
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">
                      Application Form
                    </p>
                    <p className="text-sm text-green-600">
                      All required information provided
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">
                      Documents Signed
                    </p>
                    <p className="text-sm text-green-600">
                      Rental agreement signed and ready for submission
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Ready for Submission
                  </h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Your application will be sent to{" "}
                    <span className="font-medium">{landlordName}</span> at{" "}
                    <span className="font-medium">{landlordEmail}</span>
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Processing time: 1-2 business days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
              <RestartApplication disable={loading} />
              <button
                onClick={() => sendApplication()}
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Submitting Application...
                  </span>
                ) : (
                  <>
                    <SendHorizontal className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Application Submitted Successfully!
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-left">
                  <p className="font-medium text-green-900 mb-1">Next Steps:</p>
                  <p className="text-green-700 text-sm mb-2">
                    Please send your rent deposit to the landlord's email
                    address - {"  "}
                    <span className="font-medium">{landlordEmail}</span>
                  </p>
                </div>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  You can now safely close this application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitApplication;
