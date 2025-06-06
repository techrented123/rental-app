import React, { useState } from "react";
import { Form } from "./Form";
import { ApplicationFormInfo } from "@/types";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import VerificationResult, {
  VerificationStatus,
} from "../IDVerification/VerificationResult";
import { Loader2 } from "lucide-react";
type ErrorMap = Record<string, string>;

export default function ApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");

  const { updateStepOutput, updateRentApplicationStatus, stepOutputs } =
    useRentalApplicationContext();

  const { state, lengthOfStay, ...userInfo } = stepOutputs[3].prospect;
  const toggleErrors = (name: string) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const validateForm = (formData: ApplicationFormInfo): boolean => {
    const newErrors: ErrorMap = {};
    let isValid = true;
    // Recursive helper
    function check(value: object | string | boolean, path: string) {
      if (typeof value === "string") {
        // string field must be non-empty
        if (!value.trim()) {
          newErrors[path] = "This field is required";
          isValid = false;
        }
      } else if (typeof value === "boolean") {
        // only termsAndConditions is boolean; require true
        if (path === "termsAndConditions" && !value) {
          newErrors[path] = "You must accept the terms and conditions";
          isValid = false;
        }
      } else if (Array.isArray(value)) {
        // for arrays, include the index in the path
        value.forEach((item, idx) => {
          check(item, `${path}_${idx}`);
        });
      } else if (typeof value === "object" && value !== null) {
        // nested object: recurse on each key
        Object.entries(value).forEach(([k, v]) => {
          check(v, path ? `${path}_${k}` : k);
        });
      }
      // other types (numbers, etc.) can be added here if needed
    }

    // Kick off recursion for each top‐level field
    Object.entries(formData).forEach(([key, val]) => {
      check(val, key);
    });
    // Update state and return validity
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (prospectInfo: ApplicationFormInfo) => {
    setVerificationStatus("verifying");
    updateStepOutput(prospectInfo);
    updateRentApplicationStatus(5);

    setTimeout(() => {
      setVerificationStatus("success");
    }, 1500);
  };

  return (
    <main className="container mx-auto px-4 py-3 md:py-8 w-full ">
      {verificationStatus === "idle" ? (
        <div className="bg-white rounded-lg shadow-none p-2 md:p-6">
          <Form
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onValidateForm={validateForm}
            errors={errors}
            toggleErrors={toggleErrors}
            preFilledFields={userInfo}
          />
        </div>
      ) : verificationStatus === "verifying" ? (
        <div className="md:mt-[150px] flex justify-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="md:mt-10">
          <VerificationResult
            title={"Form Successfully Submitted"}
            subtitle={"Proceed to the next step"}
          />
        </div>
      )}
    </main>
  );
}
