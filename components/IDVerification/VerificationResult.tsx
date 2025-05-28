import React from "react";
import { CheckCircle, XCircle, FileText,  } from "lucide-react";
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
  console.log({ isSuccessTitle, subtitle });
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`p-4 rounded-full mb-6 ${
          isSuccessTitle ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {isSuccessTitle ? (
          <CheckCircle className="h-12 w-12 text-green-500" />
        ) : (
          <XCircle className="h-12 w-12 text-red-500" />
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-3">{title}</h2>

      <p
        className={`text-lg mb-6 ${
          isSuccessTitle ? "text-green-700" : "text-red-700"
        }`}
      >
        {subtitle ||
          (isSuccessTitle
            ? "All document properties have been verified."
            : "The document does not meet the verification requirements.")}
      </p>

      {fileName && (
        <div className="flex items-center justify-center mb-6 text-gray-500">
          <FileText className="h-5 w-5 mr-2" />
          <span>{fileName}</span>
        </div>
      )}

      {!isSuccessTitle && (
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
