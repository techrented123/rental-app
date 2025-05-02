"use client";

import React, { createContext, useState } from "react";

interface RentalApplicationData {
  selectedPlan?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface RentalApplicationContextType {
  formData: RentalApplicationData;
  updateFormData: (data: Partial<RentalApplicationData>) => void;
}

const defaultContext: RentalApplicationContextType = {
  formData: {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  },
  updateFormData: () => {},
};

export const RentalApplicationContext = createContext<RentalApplicationContextType>(defaultContext);

export function RentalApplicationProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<RentalApplicationData>(defaultContext.formData);

  const updateFormData = (newData: Partial<RentalApplicationData>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  return (
    <RentalApplicationContext.Provider value={{ formData, updateFormData }}>
      {children}
    </RentalApplicationContext.Provider>
  );
}