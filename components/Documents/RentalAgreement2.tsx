"use client ";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { FileText, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";

const templates = [
  {
    templateId: "68b8e681-118d-4e92-8b8b-12ae4f338df2",
    fileName: "BC Tenancy Agreement",
    placeHolders: ["Landlord", "Applicant"],
  },
  {
    templateId: "8e6ae6a6-05a1-47ae-8dee-96631f1c7041",
    fileName: "Crime Free Living Addendum",
    placeHolders: ["Landlord", "Applicant"],
  },
  {
    templateId: "3a3605a0-5baa-4405-9fc5-5234ba799f66",
    fileName: "Disclosure Representation Trading Services Form",
    placeHolders: ["Real Estate Agent", "Applicant"],
  },
  {
    templateId: "08f16f1b-baa1-4a62-b10e-22adeb874e9e",
    fileName: "Tenancy Addednum",
    placeHolders: ["Landlord", "Applicant"],
  },

  {
    templateId: "b74fedb6-ea69-4e6a-aae8-69bd2d772086",
    fileName: "Address for Service",
    placeHolders: ["Landlord", "Applicant"],
  },
];
export function RentalAgreement2() {
  const {
    updateRentApplicationStatus,
    updateStepOutput,
    rentalInfo,
    stepOutputs,
  } = useRentalApplicationContext();
  const [fields, setFields] = useState();
  const [signingUrl, setSigningUrl] = useState<string>();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>();
  const { firstName, lastName, email } = stepOutputs[2].prospect;
  const [linkClickStatuses, setLinkClickStatuses] = useState<number[]>([]);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.signwell.com/assets/embedded.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const startSigning = async (templateInfo: any) => {
    setLoading((prev) => ({ ...prev, [templateInfo.templateId]: true }));
    setError(undefined);
    try {
      const res = await fetch("/api/signwell/create-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateInfo,
          tenant: {
            firstName,
            lastName,
            tenantEmail: email,
          },
          rentalInfo,
        }),
      });
      const json = await res.json();
      console.log({ json });
      if (!res.ok) throw new Error(json.error || "SignWell error");
      setSigningUrl(json.signingUrl);
      setFields(json.fields);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading((prev) => ({
        ...prev,
        [templateInfo.templateId]: false,
      }));
    }
  };

  React.useEffect(() => {
    updateRentApplicationStatus(4);
    updateStepOutput(null);
  }, []);

  useEffect(() => {
    if (signingUrl && (window as any).SignWellEmbed) {
      const embed = new (window as any).SignWellEmbed({
        url: signingUrl,
        events: {
          completed: (e: any) => {
            console.log(e, "Tenant has completed signing.");
            //setLoading((prev) => ({ ...prev, [templateInfo.id]: false }));
          },
          closed: (e: any) => {
            console.log(e, "Signing modal closed.");
          },
        },
      });
      embed.open();
    }
  }, [signingUrl]);

  console.log({ fields });

  function clickHandler(
    index: number,
    arg1: { templateId: string; fileName: string; placeHolders: string[] }
  ): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <h4 className="text-center font-medium text-lg mt-4">
        Fill out and sign each of the forms below
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 place-items-center justify-center mt-10">
        {templates.map((template, index) => (
          <button
            key={template.templateId}
            className={`hover:bg-gray-100 p-6 hover:border rounded-lg  ${
              linkClickStatuses.includes(1) ? "text-green-700 " : ""
            }`}
            onClick={() =>
              clickHandler(index, {
                templateId: template.templateId,
                fileName: template.fileName,
                placeHolders: template.placeHolders,
              })
            }
          >
            {loading[template.templateId] ? (
              <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
            ) : (
              <div className="flex flex-col items-center">
                <FileText size={100} strokeWidth={1} />
                <h3 className="flex items-center gap-1">{template.fileName}</h3>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
