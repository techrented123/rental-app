"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { clearIndexedDB } from "@/lib/utils";
import {
  getOrCreateSessionId,
  updateTrackingCookie,
  getTrackingDataFromCookie,
} from "@/lib/tracking";

interface RentalApplicationContextType {
  currentRentApplicationStep: number;
  updateRentApplicationStatus: (index: number, shouldTrack?: boolean) => void;
  rentalInfo: any;
  updateRentalInfo: (updatedrentalInfo: any) => void;
  stepOutputs: Array<File | any>;
  updateStepOutput: (updatedStepOutput: File | any) => void;
  restartApplication: () => void;
  sessionId: string | null;
  trackActivity: (
    step: number,
    email?: string,
    name?: string,
    verification_report_url?: string,
    data?: Record<string, any>,
    signature?: boolean
  ) => Promise<void>;
  restoreState: (
    newStepOutputs: any[],
    newRentalInfo: any,
    newStep: number
  ) => void;
}

const defaultContext: RentalApplicationContextType = {
  currentRentApplicationStep: 1,
  rentalInfo: {},
  stepOutputs: [],
  updateRentalInfo: (updatedRentalState: string) => {},
  updateRentApplicationStatus: (index: number, shouldTrack?: boolean) => {},
  updateStepOutput: (updatedStepOutput: {
    key: string;
    fileName: string;
  }) => {},
  restartApplication: () => {},
  sessionId: null,
  trackActivity: async (
    step: number,
    email?: string,
    name?: string,
    verification_report_url?: string,
    data?: Record<string, any>,
    signature?: boolean
  ) => {},
  restoreState: (
    newStepOutputs: any[],
    newRentalInfo: any,
    newStep: number
  ) => {},
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

  const searchParams = useSearchParams();

  // Initialize session ID on mount - prioritize URL parameter
  React.useEffect(() => {
    const urlSessionId = searchParams?.get("sessionId");
    
    if (urlSessionId) {
      // Use sessionId from URL and update cookie
      setSessionId(urlSessionId);
      Cookies.set("application_session_id", urlSessionId, { expires: 30 });
    } else {
      // Fall back to cookie or generate new one
      const id = getOrCreateSessionId();
      setSessionId(id);
    }
  }, [searchParams]);

  // Track activity to server
  const trackActivity = useCallback(
    async (step: number, email?: string, name?: string, verification_report_url?: string, data?: Record<string, any>, signature?: boolean) => {
      if (!sessionId) return;

      // Get address from rentalInfo
      const address = (rentalInfo as any)?.address;
      
      // Try to get email from cookie if not provided
      let currentEmail = email;
      if (!currentEmail) {
         const trackingData = getTrackingDataFromCookie();
         currentEmail = trackingData?.email;
      }

      try {
        const response = await fetch("/api/track-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            step,
            email: currentEmail,
            name,
            address,
            property:
              (rentalInfo as any)?.slug || (rentalInfo as any)?.property,
            verification_report_url,
            data,
            signature,
            rentalInfo,
          }),
        });

        const responseData = await response.json();

        // Sync sessionId from server if it changed
        if (responseData.sessionId && responseData.sessionId !== sessionId) {
          setSessionId(responseData.sessionId);
          Cookies.set("application_session_id", responseData.sessionId, {
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
      setStepOutputs((prev: any) => {
        const newOutputs = [...prev];
        // Ensure the array is long enough
        while (newOutputs.length <= currentRentApplicationStep) {
          newOutputs.push(undefined);
        }
        newOutputs[currentRentApplicationStep] = updatedStepOutput;
        
        window.localStorage.setItem(
          "step_outputs",
          JSON.stringify(newOutputs)
        );
        return newOutputs;
      });

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
    [sessionId, currentRentApplicationStep, trackActivity]
  );

  const restartApplication = async () => {
    // Clear storage first
    window.localStorage.clear();
    
    // Clear IndexedDB to free up storage space
    try {
      await clearIndexedDB();
      console.log("IndexedDB cleared successfully");
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
    }

    // Reset state
    setStepOutputs([]);
    setRentalInfo({});
    
    // Update status to 1 and track it (this will also persist the step to localStorage)
    await updateRentApplicationStatus(0, true);
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
      // Note: Address tracking is now handled by /api/track-application through trackActivity

      console.log({ newRentalInfo });
    },
    [sessionId, currentRentApplicationStep]
  );

  console.log({ rentalInfo });

  const updateRentApplicationStatus = React.useCallback(
    async (index: number, shouldTrack: boolean = true) => {
      setRentApplicationStatus(index);
      window.localStorage.setItem("last_saved_step", JSON.stringify(index));

      // Track step change
      if (sessionId && shouldTrack) {
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

  const restoreState = useCallback((
    newStepOutputs: any[],
    newRentalInfo: any,
    newStep: number
  ) => {
    if (newStepOutputs) {
      setStepOutputs(newStepOutputs);
      window.localStorage.setItem("step_outputs", JSON.stringify(newStepOutputs));
    }
    
    if (newRentalInfo) {
      setRentalInfo((prev: any) => {
        const updated = { ...prev, ...newRentalInfo };
        window.localStorage.setItem("rental_and_applicant_info", JSON.stringify(updated));
        return updated;
      });
    }

    if (newStep > 0) {
      setRentApplicationStatus(newStep);
      window.localStorage.setItem("last_saved_step", JSON.stringify(newStep));
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
        restoreState,
      }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
