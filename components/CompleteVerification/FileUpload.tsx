import React, { useState, useRef, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

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
    <div>
      {isVerifying ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Verifying Document
          </h3>
          {fileName && (
            <div className="flex items-center text-gray-500">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">{fileName}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
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
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 bg-blue-100 p-4 rounded-full">
              <Upload className="h-4 w-4 md:h-8 md:w-8 text-blue-500" />
            </div>
            <h3 className="md:text-lg font-medium text-gray-700 mb-2">
              Upload your Complete 3-in-1 Verification Report
            </h3>

            <p className="text-gray-500 text-sm mb-4 max-w-md hidden md:block">
              Drag and drop your PDF file here or select a file
            </p>
            <p className="text-gray-500 text-sm mb-4 max-w-md md:hidden">
              Drag and drop or
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-5 py-2 rounded-lg text-xs md:text-base md:font-medium transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Select PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteVerification;
