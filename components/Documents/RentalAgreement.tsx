"use client";

import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { useState, useEffect } from "react";
import AlertDialogBox from "../ui/alert-dialog";

export function RentalAgreement() {
  const [signingUrl, setSigningUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateStepOutput, rentalInfo, stepOutputs } =
    useRentalApplicationContext();

  // 1) Load SignWell’s embed script
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://static.signwell.com/assets/embedded.js";
    s.async = true;
    document.body.appendChild(s);

    return () => {
      document.body.removeChild(s);
    };
  }, []);

  const { firstName, lastName, email } = stepOutputs[3].prospect;

  // 2) Kick off creation & get the embed URL
  const startSigning = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signwell/create-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalInfo,
          tenant: {
            firstName,
            lastName,
            tenantEmail: email,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "SignWell error");
      setSigningUrl(json.signingUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3) Open the embedded signing modal once URL is ready
  useEffect(() => {
    if (signingUrl && (window as any).SignWellEmbed) {
      const embed = new (window as any).SignWellEmbed({
        url: signingUrl,
        events: {
          completed: () => {
            console.log("Tenant has completed signing.");
            updateStepOutput(true);
          },
          closed: () => {
            console.log("Signing modal closed.");
          },
        },
      });
      embed.open();
    }
  }, [signingUrl]);

  return (
    <div className="text-center mt-40 space-y-3">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <AlertDialogBox
        title="Confirmation"
        description={
          <ul className="my-3 space-y-2 ml-5">
            <li className="list-disc">
              Once you start signing, you must complete it in one sitting. You
              will not be able to sign again once the document window is closed.{" "}
            </li>
            <li className="list-disc">
              All parties will receive a copy of this form via email to fill and
              sign their respective fields once you complete signing it
            </li>
          </ul>
        }
        proceedBtnText="Continue"
        onProceed={startSigning}
      >
        <button
          disabled={loading || !!signingUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Preparing document…" : "Sign Lease Agreement"}
        </button>
      </AlertDialogBox>
    </div>
  );
}
