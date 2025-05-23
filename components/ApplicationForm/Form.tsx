import React, { useState } from "react";
import { ApplicationFormInfo } from "@/types";

import { UserCheck, AlertCircle, Plus, X } from "lucide-react";
interface ApplicationFormProps {
  onSubmit: (info: ApplicationFormInfo) => void;
  isLoading: boolean;
  onValidateForm: (formData: ApplicationFormInfo) => boolean;
  //onAddField: () => void;
  //onRemoveRentalHistory: (id: number) => void;
  //inputFields: ApplicationFormInfo;
  errors: Partial<Record<keyof ApplicationFormInfo, any>>;
  toggleErrors: (name: string) => void;
}

export const Form: React.FC<ApplicationFormProps> = ({
  onSubmit,
  isLoading,
  onValidateForm,
  errors,
  toggleErrors,
}) => {
  const [preventSubmit, setPreventSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<ApplicationFormInfo>({
    applicant: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      emergencyContactFirstName: "",
      emergencyContactLastName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
    },
    rentalHistory: [
      {
        id: 0,
        address: "",
        city: "",
        state: "",
        postalCode: "",
        landlordPhone: "",
        landlordEmail: "",
        landlordFirstName: "",
        landlordLastName: "",
        fromDate: "",
        toDate: "",
        country: "",
        rent: "",
        reasonForLeaving: "",
      },
    ],
    truthConfirmation: { name: "", dateSigned: "" },
  });

  /*  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    // name is like "applicant_firstName" or "rentalHistory_0_address"
    const [group, idxOrKey, maybeKey] = name.split("_");

    setFormData((prev) => {
      // if this is an array group...
      if (Array.isArray(prev[group])) {
        const idx = Number(idxOrKey);
        return {
          ...prev,
          [group]: prev[group].map((entry, i) =>
            i === idx ? { ...entry, [maybeKey as string]: value } : entry
          ),
        };
      }

      // otherwise it's a plain object group
      return {
        ...prev,
        [group]: {
          ...(prev[group] as Record<string, any>),
          [idxOrKey]: value,
        },
      };
    });

    // clear any error on that exact key
    if (errors[name]) toggleErrors(name);
  } */

  const addRentalHistory = React.useCallback(() => {
    setFormData((prev) => {
      const { rentalHistory } = { ...prev };
      if (rentalHistory.length < 3) {
        let updatedRentalHistory;
        updatedRentalHistory = [
          ...rentalHistory,
          {
            id: rentalHistory[rentalHistory.length - 1]?.id + 1,
            address: "",
            city: "",
            state: "",
            postalCode: "",
            landlordPhone: "",
            landlordEmail: "",
            landlordFirstName: "",
            landlordLastName: "",
            fromDate: "",
            toDate: "",
            country: "",
            rent: "",
            reasonForLeaving: "",
          },
        ];

        return {
          ...prev,
          rentalHistory: updatedRentalHistory,
        };
      }
      return { ...prev };
    });
  }, []);

  const removeRentalHistory = (id: number) => {
    console.log({ id });
    setFormData((prev) => {
      const { rentalHistory } = { ...prev };

      const updatedRentalHistory = rentalHistory.filter(
        (item) => item.id !== id
      );
      return { ...prev, rentalHistory: updatedRentalHistory };
    });
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const path = name.split("_"); // e.g. ["employment","0","employerName"]

    setFormData((prev) => {
      // Make a shallow clone of the root
      const updated = { ...prev } as any;

      // Keep a reference for walking
      let cursor: any = updated;

      // For each segment except the last, clone that level
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];

        if (Array.isArray(cursor)) {
          // numeric index into array
          const idx = parseInt(key, 10);
          cursor[idx] = Array.isArray(cursor[idx])
            ? [...cursor[idx]]
            : { ...cursor[idx] };
          cursor = cursor[idx];
        } else {
          // object key
          cursor[key] = Array.isArray(cursor[key])
            ? [...cursor[key]]
            : { ...cursor[key] };
          cursor = cursor[key];
        }
      }

      // Finally, set the value on the last key
      const lastKey = path[path.length - 1];
      cursor[lastKey] = value;

      return updated as typeof prev;
    });

    if (errors[name as keyof ApplicationFormInfo]) {
      toggleErrors(name);
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidateForm(formData);
    if (onValidateForm(formData)) {
      setPreventSubmit(true);
      onSubmit(formData);
    }
  };
  console.log({ formData });
  return (
    <div className="w-full">
      <div className=" mb-6 flex flex-col items-center">
        <div className="flex">
          <UserCheck className="h-6 w-6 text-blue-700 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Tenant Application Form
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Applicant Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>

              <input
                id="applicant_firstName"
                name="applicant_firstName"
                type="text"
                value={formData.applicant.firstName}
                onChange={handleChange}
                className={`
      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
      ${errors.applicant?.firstName ? "border-red-500" : "border-gray-300"}
    `}
              />

              {errors.applicant?.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="applicant_lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="applicant_lastName"
                name="applicant_lastName"
                value={formData.applicant.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.lastName
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="applicant_email"
                name="applicant_email"
                value={formData.applicant.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.email
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="applicant_phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number{" "}
              </label>
              <input
                type="phone"
                id="applicant_phone"
                name="applicant_phone"
                value={formData.applicant.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.phone
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="applicant_address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Address
            </label>
            <input
              type="address"
              id="applicant_address"
              name="applicant_address"
              value={formData.applicant.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.applicant && errors.applicant.address
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.applicant && errors.applicant.address && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.applicant.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                type="text"
                id="applicant_city"
                name="applicant_city"
                value={formData.applicant.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.city
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.city}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="applicant_state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Province/State
              </label>
              <input
                type="text"
                id="applicant_state"
                name="applicant_state"
                value={formData.applicant.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.state
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.state && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.state}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="applicant_country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country
            </label>
            <input
              type="text"
              id="applicant_country"
              name="applicant_country"
              value={formData.applicant.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.applicant && errors.applicant.country
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.applicant && errors.applicant.country && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.applicant.country}
              </p>
            )}
          </div>

          {/*Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span
                //htmlFor="applicant_emergencyContactFirstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Emergency Contact Name
              </span>
              <input
                type="text"
                id="applicant_emergencyContactFirstName"
                name="applicant_emergencyContactFirstName"
                placeholder="First name"
                value={formData.applicant.emergencyContactFirstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.emergencyContactFirstName
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant &&
                errors.applicant.emergencyContactFirstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.applicant.emergencyContactFirstName}
                  </p>
                )}
            </div>
            <div>
              <input
                type="text"
                id="applicant_emergencyContactLastName"
                name="applicant_emergencyContactLastName"
                placeholder="Last name"
                value={formData.applicant.emergencyContactLastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 mt-6 border ${
                  errors.applicant && errors.applicant.emergencyContactLastName
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant &&
                errors.applicant.emergencyContactLastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.applicant.emergencyContactLastName}
                  </p>
                )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_emergencyContactRelationship"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Emergency Contact Relationship
              </label>
              <input
                type="text"
                id="applicant_emergencyContactRelationship"
                name="applicant_emergencyContactRelationship"
                value={formData.applicant.emergencyContactRelationship}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant &&
                  errors.applicant.emergencyContactRelationship
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant &&
                errors.applicant.emergencyContactRelationship && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.applicant.emergencyContactRelationship}
                  </p>
                )}
            </div>
            <div>
              <label
                htmlFor="applicant_emergencyContactPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Emergency Contact Phone Number
              </label>
              <input
                type="text"
                id="applicant_emergencyContactPhone"
                name="applicant_emergencyContactPhone"
                value={formData.applicant.emergencyContactPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.applicant && errors.applicant.emergencyContactPhone
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.applicant && errors.applicant.emergencyContactPhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.applicant.emergencyContactPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-16" />

        {/*Rental History */}
        <div className="space-y-4">
          <h3 className="font-medium">Rental History</h3>
          {formData.rentalHistory.map((item, index, arr) => {
            const addressFieldName = `rentalHistory_${index}_address`;
            const cityFieldName = `rentalHistory_${index}_city`;
            const stateFieldName = `rentalHistory_${index}_state`;
            const countryFieldName = `rentalHistory_${index}_country`;
            const postalCodeFieldName = `rentalHistory_${index}_postalCode`;
            const landlordFirstNameFieldName = `rentalHistory_${index}_landlordFirstName`;
            const landlordLastNameFieldName = `rentalHistory_${index}_landlordLastName`;
            const landlordPhoneFieldName = `rentalHistory_${index}_landlordPhone`;
            const fromDateFieldName = `rentalHistory_${index}_fromDate`;
            const toDateFieldName = `rentalHistory_${index}_toDate`;
            const rentFieldName = `rentalHistory_${index}_rent`;
            const reasonForLeavingFieldName = `rentalHistory_${index}_reasonForLeaving`;

            return (
              <div key={item.id} className="space-y-4 ">
                <div>
                  <label
                    htmlFor={addressFieldName}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id={addressFieldName}
                    name={addressFieldName}
                    value={item.address}
                    onChange={(e) => {
                      setFormData((prev) => {
                        const rentalHistory = prev.rentalHistory;
                        const updatedRentalHistory = rentalHistory.map(
                          (history) => {
                            if (history.id === item.id)
                              return { ...history, address: e.target.value };
                            return { ...history };
                          }
                        );
                        console.log({ updatedRentalHistory });
                        return { ...prev, rentalHistory: updatedRentalHistory };
                      });
                    }}
                    className={`
                      w-full px-3 py-2 border rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${
                        errors.rentalHistory?.address
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                    `}
                  />
                  {errors.rentalHistory?.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.rentalHistory.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={cityFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id={cityFieldName}
                      name={cityFieldName}
                      value={item.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
${errors.rentalHistory?.city ? "border-red-500" : "border-gray-300"}
    `}
                    />
                    {errors.rentalHistory?.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalHistory.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={stateFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Province/State
                    </label>
                    <input
                      type="text"
                      id={stateFieldName}
                      name={stateFieldName}
                      value={item.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.applicant && errors.applicant.state
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.applicant && errors.applicant.state && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.applicant.state}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={countryFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id={countryFieldName}
                      name={countryFieldName}
                      value={item.country}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.applicant && errors.applicant.city
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.applicant && errors.applicant.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.applicant.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={postalCodeFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Postal/Zip Code
                    </label>
                    <input
                      type="text"
                      id={postalCodeFieldName}
                      name={postalCodeFieldName}
                      value={item.postalCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.applicant && errors.applicant.city
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.applicant && errors.applicant.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.applicant.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={fromDateFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Rental Dates
                    </label>
                    <input
                      type="date"
                      id={fromDateFieldName}
                      name={fromDateFieldName}
                      value={item.fromDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.rentalHistory &&
                        errors.rentalHistory[index].fromDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.rentalHistory &&
                      errors.rentalHistory[index].fromDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.rentalHistory[index].fromDate}
                        </p>
                      )}
                  </div>
                  <div>
                    <label
                      htmlFor={toDateFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    />
                     
                    <input
                      type="date"
                      id={toDateFieldName}
                      name={toDateFieldName}
                      value={item.toDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border mt-5 ${
                        errors.rentalHistory &&
                        errors.rentalHistory[index].toDateFieldName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.rentalHistory &&
                      errors.rentalHistory[index].toDateFieldName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.rentalHistory[index].toDateFieldName}
                        </p>
                      )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={landlordFirstNameFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Landlord First Name
                    </label>
                    <input
                      type="text"
                      id={landlordFirstNameFieldName}
                      name={landlordFirstNameFieldName}
                      value={item.landlordFirstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.rentalHistory &&
                        errors.rentalHistory[index].landlordFirstName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.rentalHistory &&
                      errors.rentalHistory[index].landlordFirstName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.rentalHistory[index].landlordFirstName}
                        </p>
                      )}
                  </div>
                  <div>
                    <label
                      htmlFor={landlordLastNameFieldName}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Landlord Last Name
                    </label>
                    <input
                      type="text"
                      id={landlordLastNameFieldName}
                      name={landlordLastNameFieldName}
                      value={item.landlordLastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.rentalHistory &&
                        errors.rentalHistory[index].landlordLastName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.rentalHistory &&
                      errors.rentalHistory[index].landlordLastName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.rentalHistory[index].landlordLastName}
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={landlordPhoneFieldName}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Landlord's Phone No.
                  </label>
                  <input
                    type="phone"
                    id={landlordPhoneFieldName}
                    name={landlordPhoneFieldName}
                    value={item.landlordPhone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.applicant && errors.applicant.city
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.applicant && errors.applicant.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.applicant.city}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={reasonForLeavingFieldName}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reason For Leaving
                  </label>
                  <input
                    type="text"
                    id={reasonForLeavingFieldName}
                    name={reasonForLeavingFieldName}
                    value={item.reasonForLeaving}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.applicant && errors.applicant.city
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.applicant && errors.applicant.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.applicant.city}
                    </p>
                  )}
                </div>
                <div className="relative flex w-full mt-4">
                  {item.id === arr.length - 1 && arr.length !== 3 && (
                    <span
                      className="absoulte left-0 flex text-sm hover:underline hover:cursor-pointer"
                      onClick={addRentalHistory}
                    >
                      <Plus size={20} /> Add additional rental history
                    </span>
                  )}
                  {item.id !== 0 && (
                    <span
                      className="absolute right-0 flex text-sm hover:underline hover:cursor-pointer"
                      onClick={() => removeRentalHistory(item.id)}
                    >
                      <X size={20} /> Remove rental history
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <hr className="my-8" />
        {/**Agree */}
        <h3 className="font-medium mb-[-5px]">Truth Confirmation </h3>
        <span className="block text-sm font-medium">
          I confirm that all the information entered above is true to the best
          of my knowledge
        </span>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="truthConfirmation"
              className="block text-sm  text-gray-700 mb-1"
            >
              Full Name
            </label>

            <input
              id="truthConfirmation"
              name="truthConfirmation"
              type="text"
              value={formData.applicant.firstName}
              onChange={handleChange}
              className={`
      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
      ${errors.applicant?.firstName ? "border-red-500" : "border-gray-300"}
    `}
            />

            {errors.applicant?.firstName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.applicant.firstName}
              </p>
            )}
          </div>{" "}
          <div>
            <label
              htmlFor="applicant_firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Signed
            </label>
            <input
              type="date"
              id="applicant_city"
              name="applicant_city"
              value={""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.applicant && errors.applicant.city
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || preventSubmit}
            className={`w-full py-3 px-4 bg-blue-700 text-white font-medium rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Background Check...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
