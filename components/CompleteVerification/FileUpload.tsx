import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CloudUpload,
  CheckCircle,
} from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isVerifying?: boolean;
  fileName?: string | null;
}

const CompleteVerification: React.FC<FileUploadProps> = ({
  onFileUpload,
  isVerifying,
  fileName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileUpload(file);
      }
    }
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef?.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.type === "application/pdf") onFileUpload(file);
      }
    },
    []
  );

  return (
    <div className="w-full">
      {isVerifying ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Verifying Document
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Please wait while we verify your document...
          </p>
          {fileName && (
            <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">
                {fileName}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <div
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 cursor-pointer group ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              {/* Upload Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                  <CloudUpload className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Upload Verification Report
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto leading-relaxed">
                Drag and drop your PDF file here, or click to browse and select
                a file
              </p>

              {/* File Requirements */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>PDF files only • Max 10MB</span>
                </div>
              </div>

              {/* Upload Button */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Choose PDF File
              </button>

              {/* Mobile Alternative */}
              <p className="text-gray-500 text-xs mt-4 sm:hidden">
                Tap to select a file from your device
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteVerification;
