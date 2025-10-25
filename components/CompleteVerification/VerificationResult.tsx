import React from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  Shield,
  AlertTriangle,
} from "lucide-react";
export type VerificationStatus = "idle" | "verifying" | "success" | "error";

interface VerificationResultProps {
  title: string;
  subtitle: string | null;
  fileName?: string | null;
  onReset?: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  fileName,
  title,
  subtitle,
  onReset,
}) => {
  const isSuccessTitle = title.toLowerCase().includes("success");

  return (
    <div className="w-full">
      {/* Result Header */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            isSuccessTitle ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isSuccessTitle ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-bold mb-3 ${
            isSuccessTitle ? "text-green-600" : "text-red-600"
          }`}
        >
          {title}
        </h2>

        <p
          className={`text-lg sm:text-xl mb-6 ${
            isSuccessTitle ? "text-green-700" : "text-red-700"
          }`}
        >
          {subtitle ||
            (isSuccessTitle
              ? "Document verification completed successfully"
              : "Document verification failed")}
        </p>
      </div>

      {/* File Information */}
      {fileName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">{fileName}</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccessTitle && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Verification Complete
              </h4>
              <p className="text-green-700 text-sm">
                You can now proceed to the next step of your
                application.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isSuccessTitle && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">
                  Verification Failed
                </h4>
                <p className="text-red-700 text-sm">
                  The document you uploaded does not meet our verification
                  requirements. Please ensure you're uploading the correct
                  Complete 3-in-1 Verification Report.
                </p>
              </div>
            </div>
          </div>

          {/* Retry Button */}
          <div className="text-center">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationResult;
