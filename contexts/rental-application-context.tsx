"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import Cookies from "js-cookie";
import { clearIndexedDB } from "@/lib/utils";
import {
  getOrCreateSessionId,
  updateTrackingCookie,
  getTrackingDataFromCookie,
} from "@/lib/tracking";

interface RentalApplicationContextType {
  currentRentApplicationStep: number;
  updateRentApplicationStatus: (index: number) => void;
  rentalInfo: any;
  updateRentalInfo: (updatedrentalInfo: any) => void;
  stepOutputs: Array<File | any>;
  updateStepOutput: (updatedStepOutput: File | any) => void;
  restartApplication: () => void;
  sessionId: string | null;
  trackActivity: (step: number, email?: string, name?: string) => Promise<void>;
}

const defaultContext: RentalApplicationContextType = {
  currentRentApplicationStep: 1,
  rentalInfo: {},
  stepOutputs: [],
  updateRentalInfo: (updatedRentalState: string) => {},
  updateRentApplicationStatus: (index: number) => {},
  updateStepOutput: (updatedStepOutput: {
    key: string;
    fileName: string;
  }) => {},
  restartApplication: () => {},
  sessionId: null,
  trackActivity: async () => {},
};

export const RentalApplicationContext =
  createContext<RentalApplicationContextType>(defaultContext);

export const useRentalApplicationContext = () =>
  useContext(RentalApplicationContext);

export function RentalApplicationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRentApplicationStep, setRentApplicationStatus] =
    useState<number>(0);

  const [rentalInfo, setRentalInfo] = useState({});

  const [stepOutputs, setStepOutputs] = useState<any>([true]);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session ID on mount
  React.useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  // Track activity to server
  const trackActivity = useCallback(
    async (step: number, email?: string, name?: string) => {
      if (!sessionId) return;

      // Get address from rentalInfo
      const address = (rentalInfo as any)?.address;

      try {
        const response = await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step,
            email,
            name,
            address,
            property:
              (rentalInfo as any)?.slug || (rentalInfo as any)?.property,
          }),
        });

        const data = await response.json();

        // Sync sessionId from server if it changed
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          Cookies.set("application_session_id", data.sessionId, {
            expires: 30,
          });
        }

        // Update client-side cookie
        updateTrackingCookie({
          step,
          lastActivity: new Date().toISOString(),
          email,
          name,
          address,
        });
      } catch (error) {
        console.error("Error tracking activity:", error);
      }
    },
    [sessionId, rentalInfo]
  );

  const updateStepOutput = useCallback(
    async (updatedStepOutput: any) => {
      setStepOutputs((prev: any) => [...prev, updatedStepOutput]);
      window.localStorage.setItem(
        "step_outputs",
        JSON.stringify([...stepOutputs, updatedStepOutput])
      );

      // Track activity and extract name/email from verification PDF
      // PDF email can override/confirm the entered email
      if (updatedStepOutput?.subject) {
        try {
          const subject = JSON.parse(updatedStepOutput.subject);
          const { name, email: pdfEmail } = subject;

          // Get existing email from tracking cookie (if any)
          const existingTracking = getTrackingDataFromCookie();
          const existingEmail = existingTracking?.email;

          // Use PDF email if available (it can override/confirm entered email)
          // Always track with PDF email if it exists, even if different from entered email
          if (sessionId && pdfEmail) {
            // If PDF email differs from entered email, it overrides
            // If it matches, it confirms
            await trackActivity(
              currentRentApplicationStep,
              pdfEmail,
              name || undefined
            );
          } else if (sessionId && name && existingEmail) {
            // If only name is extracted but email already exists, just update name
            await trackActivity(
              currentRentApplicationStep,
              existingEmail,
              name
            );
          }
        } catch (e) {
          console.error("Error parsing subject from verification PDF:", e);
        }
      }
    },
    [stepOutputs, sessionId, currentRentApplicationStep, trackActivity]
  );

  const restartApplication = async () => {
    setStepOutputs([]);
    setRentApplicationStatus(1);
    window.localStorage.clear();

    // Clear IndexedDB to free up storage space
    try {
      await clearIndexedDB();
      console.log("IndexedDB cleared successfully");
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
    }
  };

  const updateRentalInfo = React.useCallback(
    (newRentalInfo: any) => {
      setRentalInfo((prev: any) => {
        const updatedInfo = { ...prev, ...newRentalInfo };
        // Save to localStorage with the updated state
        window.localStorage.setItem(
          "rental_and_applicant_info",
          JSON.stringify(updatedInfo)
        );
        return updatedInfo;
      });

      // Track address when rentalInfo is updated (if we have a sessionId)
      if (sessionId && newRentalInfo?.address) {
        fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step: currentRentApplicationStep,
            address: newRentalInfo.address,
            property: newRentalInfo.slug || newRentalInfo.property,
          }),
        }).catch(console.error);
      }

      console.log({ newRentalInfo });
    },
    [sessionId, currentRentApplicationStep]
  );

  console.log({ rentalInfo });

  const updateRentApplicationStatus = React.useCallback(
    async (index: number) => {
      setRentApplicationStatus(index);
      window.localStorage.setItem("last_saved_step", JSON.stringify(index));

      // Track step change
      if (sessionId) {
        await trackActivity(index);
      }
    },
    [sessionId, trackActivity]
  );

  React.useEffect(() => {
    const restoredStepOutputs = window.localStorage.getItem("step_outputs");
    const restoredRentalInfo = window.localStorage.getItem(
      "rental_and_applicant_info"
    );
    const restoredRentApplicationStatus =
      window.localStorage.getItem("last_saved_step");

    if (restoredStepOutputs) {
      setStepOutputs(JSON.parse(restoredStepOutputs));
    }

    if (restoredRentalInfo) {
      setRentalInfo(JSON.parse(restoredRentalInfo));
    }

    if (restoredRentApplicationStatus) {
      setRentApplicationStatus(JSON.parse(restoredRentApplicationStatus));
    }
  }, []);

  return (
    <RentalApplicationContext.Provider
      value={{
        currentRentApplicationStep,
        updateRentApplicationStatus,
        updateRentalInfo,
        rentalInfo,
        stepOutputs,
        updateStepOutput,
        restartApplication,
        sessionId,
        trackActivity,
      }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
