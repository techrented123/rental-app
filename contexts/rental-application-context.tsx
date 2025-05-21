"use client";

import React, { createContext, useState } from "react";

type RentalApplicationStatus = Array<any>;
/* membership: boolean;
  idVerification: boolean;
  creditCheck: boolean;
  backgroundCheck: boolean;
  applicationForm: boolean;
  documents: boolean;
  payments: boolean; */

interface RentalApplicationContextType {
  rentApplicationStatus: RentalApplicationStatus;
  updateRentApplicationStatus: (index: number) => void;
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
  updateRentApplicationStatus: (index: number) => {},
};

export const RentalApplicationContext =
  createContext<RentalApplicationContextType>(defaultContext);

export function RentalApplicationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rentApplicationStatus, setRentApplicationStatus] =
    useState<RentalApplicationStatus>(defaultContext.rentApplicationStatus);

  const updateRentApplicationStatus = React.useCallback((index: number) => {
    setRentApplicationStatus((prev) => {
      const copy = [...prev];
      return copy.map((item, itemIndex) => {
        if (index === itemIndex) return { done: !item.done };
        return item;
      });
    });
  }, []);

  return (
    <RentalApplicationContext.Provider
      value={{ rentApplicationStatus, updateRentApplicationStatus }}
    >
      {children}
    </RentalApplicationContext.Provider>
  );
}
