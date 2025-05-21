import React from "react";
import { CheckCircle, XCircle, FileText, ChevronRight } from "lucide-react";
export type VerificationStatus = "idle" | "verifying" | "success" | "error";

interface VerificationResultProps {
  status: VerificationStatus;
  message: string | null;
  fileName: string | null;
  matchedKeywords: string[];
  onReset: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  status,
  message,
  fileName,
  matchedKeywords,
  onReset,
}) => {
  const isSuccess = status === "success";
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`p-4 rounded-full mb-6 ${
          isSuccess ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-12 w-12 text-green-500" />
        ) : (
          <XCircle className="h-12 w-12 text-red-500" />
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-3">
        {isSuccess ? "Verification Successful" : "Verification Failed"}
      </h2>

      <p
        className={`text-lg mb-6 ${
          isSuccess ? "text-green-700" : "text-red-700"
        }`}
      >
        {message ||
          (isSuccess
            ? "All document properties have been verified."
            : "The document does not meet the verification requirements.")}
      </p>

      {fileName && (
        <div className="flex items-center justify-center mb-6 text-gray-500">
          <FileText className="h-5 w-5 mr-2" />
          <span>{fileName}</span>
        </div>
      )}

      {isSuccess && matchedKeywords.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full max-w-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Matched Information
          </h3>
          <ul className="space-y-2">
            {matchedKeywords.map((keyword, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-center"
              >
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isSuccess && (
        <button
          onClick={onReset}
          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${"bg-blue-500 hover:bg-blue-600 text-white"}`}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default VerificationResult;
