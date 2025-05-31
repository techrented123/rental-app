"use client";

import React, { createContext, useState, useContext } from "react";

interface RentalApplicationContextType {
  currentRentApplicationStep: number;
  updateRentApplicationStatus: (index: number) => void;
  rentalInfo: any;
  updateRentalInfo: (updatedrentalInfo: any) => void;
  stepOutputs: Array<File | any>;
  updateStepOutput: (updatedStepOutput: File | any) => void;
}

const defaultContext: RentalApplicationContextType = {
  currentRentApplicationStep: 1,
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
  const [currentRentApplicationStep, setRentApplicationStatus] = useState<number>(1);

  const [rentalInfo, setRentalInfo] = useState({});

  const [stepOutputs, setStepOutputs] = useState<any>([{0:true}]);

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
    setRentApplicationStatus(index);
    window.localStorage.setItem("last_saved_step", JSON.stringify(index));
  }, []);

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
      }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
