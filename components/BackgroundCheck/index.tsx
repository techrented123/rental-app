import React, { useState } from "react";
import { ProspectInfo, BackgroundCheckResult } from "@/types";
import ResultsPanel from "./ResultsPanel";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { Form } from "./Form";

export default function BackgroundCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const inputFields = {
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    city2: "",
    state2: "",
    lengthOfStay: "yes",
  };

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProspectInfo, string>>
  >({});

  const toggleErrors = (name: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };
  const validateForm = (formData: ProspectInfo): boolean => {
    const newErrors: Partial<Record<keyof ProspectInfo, string>> = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== "city2" && key !== "state2") {
        newErrors[key as keyof ProspectInfo] = "This field is required";
        isValid = false;
      }
      if (formData["lengthOfStay"] === "no") {
        if (!formData["city2"]) {
          newErrors["city2"] = "This field is required";
          isValid = false;
        }
        if (!formData["state2"]) {
          newErrors["state2"] = "This field is required";
          isValid = false;
        }
      } else if (formData["lengthOfStay"] === "yes") {
        formData["city2"] = undefined;
        formData["state2"] = undefined;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const [results, setResults] = useState<BackgroundCheckResult | null>(null);
  const { updateRentApplicationStatus, updateStepOutput } =
    useRentalApplicationContext();

  const handleSubmit = async (prospectInfo: ProspectInfo) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/background-check", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...prospectInfo }),
      });
      const data = await response.json();
      setResults(data);
      updateRentApplicationStatus(4);
      updateStepOutput(data);
    } catch (error) {
      console.error("Error performing background check:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {!results ? (
            <div className="bg-white rounded-lg p-6">
              <Form
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onValidateForm={validateForm}
                inputFields={inputFields}
                errors={errors}
                toggleErrors={toggleErrors}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <ResultsPanel results={results} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function generateOverallRecommendation(
  risk: string,
  prospectType: string
): string {
  switch (risk) {
    case "low":
      return `Based on comprehensive analysis, this ${prospectType} presents low risk. Public records and online presence indicate stability and reliability.`;
    case "medium":
      return `This ${prospectType} presents moderate risk factors that warrant additional verification. Consider requesting clarification on specific findings.`;
    case "high":
      return `This ${prospectType} presents significant risk factors based on public records. Strongly recommend thorough review of findings before proceeding.`;
    default:
      return "";
  }
}
