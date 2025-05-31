// components/SignwellLeaseSigner.tsx
"use client";

import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { useState, useEffect } from "react";



export function RentalAgreement() {
  const [signingUrl, setSigningUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const {
    updateRentApplicationStatus,
    updateStepOutput,
    rentalInfo,
    stepOutputs,
  } = useRentalApplicationContext();
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

  const { firstName, lastName, email } = stepOutputs[2].prospect;

  // 2) Kick off creation & get the embed URL
  const startSigning = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/signwell/create2", {
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
            updateRentApplicationStatus(4)
          },
          closed: () => {
            console.log("Signing modal closed.");
          },
        },
      });
      embed.open();
    }
  }, [signingUrl]);

  useEffect(() => {
    //startSigning();
  }, []);

  return (
    <div className="flex justify-center mt-40">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button
        onClick={startSigning}
        disabled={loading || !!signingUrl}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Preparing document…" : "Sign Lease Agreement"}
      </button>
    </div>
  );
}
