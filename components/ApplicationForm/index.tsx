import React, { useState } from "react";
import { Form } from "./Form";
import { ApplicationFormInfo, RentalHistoryEntry } from "@/types";

export default function ApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);

  
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationFormInfo, string>>
  >({});

  const toggleErrors = (name: string) => {
    const path = name.split("_"); // same delimiter as handleChange

    setErrors((prev) => {
      // 1) shallow‐clone the root of your errors object
      const updated = { ...prev } as any;
      let cursor = updated;

      // 2) walk & clone each level except the last
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cursor[key] = Array.isArray(cursor[key])
          ? [...cursor[key]]
          : { ...cursor[key] };
        cursor = cursor[key];
      }

      // 3) remove (or undefine) the final error key
      const lastKey = path[path.length - 1];
      delete cursor[lastKey];
      // —or, if you really want it to exist but be undefined:
      // cursor[lastKey] = undefined;

      return updated;
    });
  };

  console.log({ errors });

  type ErrorMap = Record<string, string>;

  const validateForm = (formData: ApplicationFormInfo): boolean => {
    const newErrors: ErrorMap = {};
    let isValid = true;

    // Recursive helper
    function check(value: any, path: string) {
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

  const [results, setResults] = useState(null);
  //const { updateRentApplicationStatus } = useContext(RentalApplicationContext);

  const handleSubmit = async (prospectInfo: ApplicationFormInfo) => {
    setIsLoading(true);

    try {
      // Mock API delay
      //await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await fetch("/api/backrrground-check", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...prospectInfo }),
      });
      const data = await response.json();
      setResults(data);
      console.log(data);
      //updateRentApplicationStatus(4);
    } catch (error) {
      console.error("Error performing background check:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Form
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onValidateForm={validateForm}
            errors={errors}
            toggleErrors={toggleErrors}
          />
        </div>
      </main>
    </div>
  );
}
