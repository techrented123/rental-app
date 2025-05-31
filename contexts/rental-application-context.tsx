"use client";

import React, { createContext, useState, useContext } from "react";

type RentalApplicationStatus = Array<number>;

interface RentalApplicationContextType {
  rentApplicationStatus: RentalApplicationStatus;
  updateRentApplicationStatus: (index: number) => void;
  rentalInfo: any;
  updateRentalInfo: (updatedrentalInfo: any) => void;
  stepOutputs: Array<File | any>;
  updateStepOutput: (updatedStepOutput: File | any) => void;
}

const defaultContext: RentalApplicationContextType = {
  rentApplicationStatus: [],
  rentalInfo: {},
  stepOutputs: [],
  updateRentalInfo: (updatedRentalState: string) => {},
  updateRentApplicationStatus: (index: number) => {},
  updateStepOutput: (updatedStepOutput: File | any) => {},
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
  const [rentApplicationStatus, setRentApplicationStatus] =
    useState<RentalApplicationStatus>([0]);

  const [rentalInfo, setRentalInfo] = useState({});

  const [stepOutputs, setStepOutputs] = useState<any>([]);

  const updateStepOutput = (updatedStepOutput: any) => {
    setStepOutputs((prev: any) => [...prev, updatedStepOutput]);
    window.localStorage.setItem(
      "step_outputs",
      JSON.stringify([...stepOutputs, updatedStepOutput])
    );
  };

  const updateRentalInfo = React.useCallback((newRentalInfo: any) => {
    setRentalInfo((prev: any) => ({ ...prev, ...newRentalInfo }));
    window.localStorage.setItem(
      "rental_and_applicant_info",
      JSON.stringify({ ...rentalInfo, ...newRentalInfo })
    );
  }, []);

  const updateRentApplicationStatus = React.useCallback((index: number) => {
    setRentApplicationStatus((prev) => [...prev, index]);
    window.localStorage.setItem("last_saved_step", JSON.stringify(index));
  }, []);

  React.useEffect(() => {
    const restoredStepOutputs = window.localStorage.getItem("step_outputs");
    const restoredRentalInfo = window.localStorage.getItem(
      "rental_and_applicant_info"
    );

    if (restoredStepOutputs) {
      setStepOutputs(JSON.parse(restoredStepOutputs));
    }

    if (restoredRentalInfo) {
      setRentalInfo(JSON.parse(restoredRentalInfo));
    }
  }, []);

  return (
    <RentalApplicationContext.Provider
      value={{
        rentApplicationStatus,
        updateRentApplicationStatus,
        updateRentalInfo,
        rentalInfo,
        stepOutputs,
        updateStepOutput,
      }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
