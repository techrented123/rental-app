import React, { useState } from "react";
import { ApplicationFormInfo, ProspectInfo } from "@/types";

import { UserCheck, AlertCircle, Plus, X } from "lucide-react";
interface ApplicationFormProps {
  onSubmit: (info: ApplicationFormInfo) => void;
  isLoading: boolean;
  onValidateForm: (formData: ApplicationFormInfo) => boolean;
  preFilledFields?: Partial<ProspectInfo>;
 
  errors: Record<string, string>;
  toggleErrors: (name: string) => void;
}

export const Form: React.FC<ApplicationFormProps> = ({
  onSubmit,
  isLoading,
  onValidateForm,
  preFilledFields={},
  errors,
  toggleErrors,
}) => {
  const [formData, setFormData] = useState<ApplicationFormInfo>({
    applicant: {
      firstName: preFilledFields.firstName ?? "",
      lastName: preFilledFields.lastName ?? "",
      email: preFilledFields.email ?? "",
      address: "",
      city: preFilledFields.city ?? "",
      state: preFilledFields.state ?? "",
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
        landlordFirstName: "",
        landlordLastName: "",
        fromDate: "",
        toDate: "",
        country: "",
        reasonForLeaving: "",
      },
    ],
  });
  const date = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
            landlordFirstName: "",
            landlordLastName: "",
            fromDate: "",
            toDate: "",
            country: "",
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
    if (errors[name]) {
      //errors[name] = "";
      toggleErrors(name);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onValidateForm(formData)) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full overflow-auto max-h-[390px] md:max-h-full">
      <div className=" md:mb-6 flex flex-col items-center">
        <div className="md:flex hidden">
          <UserCheck className="h-6 w-6 text-blue-700 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Tenant Application Form
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 px-3">
          <h5 className="font-medium text-sm hidden md:block">
            {" "}
            Personal Information
          </h5>
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
                minLength={2}
                required
                aria-required
                className={`
      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
      ${errors["applicant_firstName"] ? "border-red-500" : "border-gray-300"}
    `}
              />

              {errors["applicant_firstName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_firstName"]}
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
                minLength={2}
                required
                aria-required
                id="applicant_lastName"
                name="applicant_lastName"
                value={formData.applicant.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_lastName"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_lastName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_lastName"]}
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
                required
                aria-required
                value={formData.applicant.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_email"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_email"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_email"]}
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
                required
                aria-required
                value={formData.applicant.phone}
                minLength={4}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_phone"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_phone"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_phone"]}
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
              minLength={5}
              required
              aria-required
              value={formData.applicant.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors["applicant_address"]
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors["applicant_address"] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors["applicant_address"]}
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
                minLength={2}
                required
                aria-required
                name="applicant_city"
                value={formData.applicant.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_city"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_city"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_city"]}
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
                minLength={2}
                required
                aria-required
                value={formData.applicant.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_state"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_state"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_state"]}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={"applicant_country"}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <input
                type="text"
                id={"applicant_country"}
                required
                aria-required
                name={"applicant_country"}
                value={formData.applicant.country}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_country"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_country"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_country"]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={"applicant_postalCode"}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Postal/Zip Code
              </label>
              <input
                type="text"
                id={"applicant_postalCode"}
                required
                aria-required
                name={"applicant_postalCode"}
                value={formData.applicant.postalCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_postalCode"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["postalCodeFieldName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["postalCodeFieldName"]}
                </p>
              )}
            </div>
          </div>

          {/*Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_emergencyContactFirstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Emergency Contact First Name
              </label>
              <input
                type="text"
                id="applicant_emergencyContactFirstName"
                minLength={2}
                required
                aria-required
                name="applicant_emergencyContactFirstName"
                value={formData.applicant.emergencyContactFirstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_emergencyContactFirstName"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_emergencyContactFirstName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_emergencyContactFirstName"]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="applicant_emergencyContactFirstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Emergency Contact Last Name
              </label>
              <input
                type="text"
                minLength={2}
                id="applicant_emergencyContactLastName"
                required
                aria-required
                name="applicant_emergencyContactLastName"
                value={formData.applicant.emergencyContactLastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_emergencyContactLastName"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_emergencyContactLastName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_emergencyContactLastName"]}
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
                minLength={3}
                id="applicant_emergencyContactRelationship"
                name="applicant_emergencyContactRelationship"
                value={formData.applicant.emergencyContactRelationship}
                onChange={handleChange}
                required
                aria-required
                className={`w-full px-3 py-2 border ${
                  errors["applicant_emergencyContactRelationship"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_emergencyContactRelationship"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_emergencyContactRelationship"]}
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
                type="tel"
                id="applicant_emergencyContactPhone"
                name="applicant_emergencyContactPhone"
                value={formData.applicant.emergencyContactPhone}
                minLength={4}
                required
                aria-required
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors["applicant_emergencyContactPhone"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors["applicant_emergencyContactPhone"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_emergencyContactPhone"]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <hr className="my-12" />
        </div>
        {/*Rental History */}
        <div className="space-y-4 px-2.5">
          <h5 className="font-medium text-sm hidden md:block">
            Rental History
          </h5>
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
                    type="address"
                    id={addressFieldName}
                    name={addressFieldName}
                    value={item.address}
                    required
                    aria-required
                    onChange={handleChange}
                    className={`
                      w-full px-3 py-2 border rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${
                        errors[addressFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      }
                    `}
                  />
                  {errors[addressFieldName] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors[addressFieldName]}
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
                      required
                      aria-required
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
${errors[cityFieldName] ? "border-red-500" : "border-gray-300"}
    `}
                    />
                    {errors[cityFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[cityFieldName]}
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
                      required
                      aria-required
                      value={item.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[stateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[stateFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[stateFieldName]}
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
                      required
                      aria-required
                      name={countryFieldName}
                      value={item.country}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[countryFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[countryFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[countryFieldName]}
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
                      required
                      aria-required
                      id={postalCodeFieldName}
                      name={postalCodeFieldName}
                      value={item.postalCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[postalCodeFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[postalCodeFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[postalCodeFieldName]}
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
                      required
                      aria-required
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[fromDateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[fromDateFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[fromDateFieldName]}
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
                      required
                      aria-required
                      value={item.toDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border mt-5 ${
                        errors[toDateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      min={item.fromDate}
                    />
                    {errors[toDateFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[toDateFieldName]}
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
                      required
                      aria-required
                      value={item.landlordFirstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[landlordFirstNameFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[landlordFirstNameFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[landlordFirstNameFieldName]}
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
                      required
                      aria-required
                      id={landlordLastNameFieldName}
                      name={landlordLastNameFieldName}
                      value={item.landlordLastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors[landlordLastNameFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors[landlordLastNameFieldName] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[landlordLastNameFieldName]}
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
                    required
                    aria-required
                    id={landlordPhoneFieldName}
                    name={landlordPhoneFieldName}
                    value={item.landlordPhone}
                    onChange={handleChange}
                    minLength={4}
                    className={`w-full px-3 py-2 border ${
                      errors[landlordPhoneFieldName]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[landlordPhoneFieldName] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors[landlordPhoneFieldName]}
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
                    required
                    aria-required
                    id={reasonForLeavingFieldName}
                    name={reasonForLeavingFieldName}
                    value={item.reasonForLeaving}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors[reasonForLeavingFieldName]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[reasonForLeavingFieldName] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors[reasonForLeavingFieldName]}
                    </p>
                  )}
                </div>
                <div className="relative flex w-full mt-4">
                  {item.id === arr.length - 1 && arr.length !== 3 && (
                    <span
                      className="absoulte left-0 flex text-sm hover:underline hover:cursor-pointer"
                      onClick={addRentalHistory}
                    >
                      <Plus size={19} /> Add additional rental history
                    </span>
                  )}
                  {item.id !== 0 && (
                    <span
                      className="absolute right-0 flex text-sm hover:underline hover:cursor-pointer"
                      onClick={() => removeRentalHistory(item.id)}
                    >
                      <X size={19} /> Remove rental history
                    </span>
                  )}
                </div>
                {item.id !== arr.length - 1 && (
                  <div>
                    <hr className="my-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div>
          <hr className="my-12" />
        </div>
        {/**Agree */}
        <h3 className="font-medium mb-[-5px]">Truth Confirmation </h3>
        <span className="block text-sm font-medium">
          I confirm that all the information entered above is true to the best
          of my knowledge
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2.5">
          <div>
            <label
              htmlFor="truthConfirmation_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>

            <input
              id="truthConfirmation_name"
              name="truthConfirmation_name"
              type="text"
              value={
                formData.applicant.firstName + " " + formData.applicant.lastName
              }
              readOnly
              className={`
      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
      ${errors["truthConfirmation_name"] ? "border-red-500" : "border-gray-300"}
    `}
            />

            {errors["truthConfirmation_name"] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors["truthConfirmation_name"]}
              </p>
            )}
          </div>{" "}
          <div>
            <label
              htmlFor="truthConfirmation_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Signed
            </label>
            <input
              type="text"
              id="truthConfirmation_date"
              name="truthConfirmation_date"
              defaultValue={date}
              className={`w-full px-3 py-2 border
               rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
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
                Running Check...
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
