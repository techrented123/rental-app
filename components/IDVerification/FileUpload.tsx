import React, { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isVerifying?: boolean;
  fileName?: string | null;
  reportType: string;
}

const IDVerification: React.FC<FileUploadProps> = ({
  onFileUpload,
  isVerifying,
  fileName,
  reportType,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        onFileUpload(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Upload your {reportType} report
            </h3>

            <p className="text-gray-500 text-sm mb-4 max-w-md">
              Drag and drop your PDF file here, or click to select a file
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200"
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

export default IDVerification;
