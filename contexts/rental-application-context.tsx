"use client";

import React, { createContext, useState, useContext } from "react";

type RentalApplicationStatus = Array<any>;

interface RentalApplicationContextType {
  rentApplicationStatus: RentalApplicationStatus;
  updateRentApplicationStatus: (index: number) => void;
  rentalState: string;
  updateRentalState: (updatedRentalState: string) => void;
  stepOutputs: Array<File | any>;
  updateStepOutput: (updatedStepOutput: File | any) => void;
}

const defaultContext: RentalApplicationContextType = {
  rentApplicationStatus: [
    { done: true },
    { done: false },
    { done: false },
    { done: false },
    { done: false },
    { done: false },
    { done: false },
  ],
  rentalState: "",
  stepOutputs: [],
  updateRentalState: (updatedRentalState: string) => {},
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
    useState<RentalApplicationStatus>(defaultContext.rentApplicationStatus);
  const [rentalState, setRentalState] = useState("");
  const [stepOutputs, setStepOutputs] = useState<any>([null]);

  const updateStepOutput = (updatedStepOutput: any) => {
    setStepOutputs((prev: any) => [...prev, updatedStepOutput]);
  };

  const updateRentalState = React.useCallback((updatedRentalState: string) => {
    setRentalState(updatedRentalState);
  }, []);

  const updateRentApplicationStatus = React.useCallback((index: number) => {
    setRentApplicationStatus((prev) => {
      const copy = [...prev];
      return copy.map((item, itemIndex) => {
        if (index === itemIndex) return { done: !item.done };
        return item;
      });
    });
  }, []);
  console.log(stepOutputs);
  return (
    <RentalApplicationContext.Provider
      value={{
        rentApplicationStatus,
        updateRentApplicationStatus,
        updateRentalState,
        rentalState,
        stepOutputs,
        updateStepOutput,
      }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
