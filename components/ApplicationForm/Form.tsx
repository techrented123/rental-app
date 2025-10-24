import React, { useState } from "react";
import { ApplicantInfo, ApplicationFormInfo } from "@/types";

import { UserCheck, AlertCircle, Plus, X } from "lucide-react";
import AddressAutocomplete from "../ui/address-autocomplete";
interface ApplicationFormProps {
  onSubmit: (info: ApplicationFormInfo) => void;
  isLoading: boolean;
  onValidateForm: (formData: ApplicationFormInfo) => boolean;
  preFilledFields: Partial<ApplicantInfo>;

  errors: Record<string, string>;
  toggleErrors: (name: string) => void;
}

export const Form: React.FC<ApplicationFormProps> = ({
  onSubmit,
  isLoading,
  onValidateForm,
  preFilledFields,
  errors,
  toggleErrors,
}) => {
  const [formData, setFormData] = useState<ApplicationFormInfo>({
    applicant: {
      fullName: preFilledFields.fullName ?? "",
      dob: preFilledFields.dob ?? "",
      gender: preFilledFields.gender ?? "",
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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

  // Helper function to update address components for applicant
  const updateAddressComponents = (components: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        city: components.city || prev.applicant.city,
        state: components.state || prev.applicant.state,
        country: components.country || prev.applicant.country,
        postalCode: components.postalCode || prev.applicant.postalCode,
      },
    }));
  };

  // Helper function to update address components for rental history
  const updateRentalAddressComponents = (
    index: number,
    components: {
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }
  ) => {
    setFormData((prev) => ({
      ...prev,
      rentalHistory: prev.rentalHistory.map((item, idx) =>
        idx === index
          ? {
              ...item,
              city: components.city || item.city,
              state: components.state || item.state,
              country: components.country || item.country,
              postalCode: components.postalCode || item.postalCode,
            }
          : item
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onValidateForm(formData)) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full overflow-auto max-h-[490px] md:max-h-full">
      <div className="md:mb-8 flex flex-col items-center">
        <div className="md:flex hidden">
          <UserCheck className="h-6 w-6 text-blue-700 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Tenant Application Form
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 px-4">
          <h5 className="font-semibold text-base text-gray-800 border-b border-gray-200 pb-2">
            Personal Information
          </h5>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="applicant_fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                minLength={2}
                required
                aria-required
                id="applicant_fullName"
                name="applicant_fullName"
                value={formData.applicant.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_fullName"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              />
              {errors["applicant_fullName"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_fullName"]}
                </p>
              )}
            </div>
          </div>

          {/* DOB and Gender Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_dob"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="applicant_dob"
                name="applicant_dob"
                required
                aria-required
                value={formData.applicant.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_dob"] ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              />
              {errors["applicant_dob"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_dob"]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="applicant_gender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gender
              </label>
              <select
                id="applicant_gender"
                name="applicant_gender"
                required
                aria-required
                value={formData.applicant.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_gender"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors["applicant_gender"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_gender"]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_email"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                placeholder="example@email.com"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_email"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="applicant_phone"
                name="applicant_phone"
                required
                aria-required
                value={formData.applicant.phone}
                minLength={10}
                maxLength={15}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                pattern="[0-9\s\(\)\-\+]{10,15}"
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_phone"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
            <AddressAutocomplete
              id="applicant_address"
              name="applicant_address"
              value={formData.applicant.address}
              onChange={(value) => {
                const syntheticEvent = {
                  target: { name: "applicant_address", value },
                } as React.ChangeEvent<HTMLInputElement>;
                handleChange(syntheticEvent);
              }}
              placeholder="Enter your current address"
              required={true}
              error={errors["applicant_address"]}
              label="Current Address"
              onAddressSelect={(address) => {
                // Auto-populate city, state, country, and postal code fields
                updateAddressComponents({
                  city: address.city,
                  state: address.state,
                  country: address.country,
                  postalCode: address.postalCode,
                });
                console.log("Address components extracted:", address);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="applicant_city"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_city"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_state"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                htmlFor="applicant_country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country
              </label>
              <input
                type="text"
                id="applicant_country"
                required
                aria-required
                name="applicant_country"
                value={formData.applicant.country}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_country"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                htmlFor="applicant_postalCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Postal/Zip Code
              </label>
              <input
                type="text"
                id="applicant_postalCode"
                required
                aria-required
                name="applicant_postalCode"
                value={formData.applicant.postalCode}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 text-sm border ${
                  errors["applicant_postalCode"]
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              />
              {errors["applicant_postalCode"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["applicant_postalCode"]}
                </p>
              )}
            </div>
          </div>
          {/* Emergency Contact Section */}
          <div className="mt-8">
            <h5 className="font-semibold text-base text-gray-800 border-b border-gray-200 pb-2 mb-4">
              Emergency Contact Information
            </h5>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="applicant_emergencyContactFirstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className={`w-full px-3 py-2.5 text-sm border ${
                    errors["applicant_emergencyContactFirstName"]
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                />
                {errors["applicant_emergencyContactFirstName"] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors["applicant_emergencyContactFirstName"]}
                  </p>
                )}
              </div>
              <div >
                <label
                  htmlFor="applicant_emergencyContactLastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className={`w-full px-3 py-2.5 text-sm border ${
                    errors["applicant_emergencyContactLastName"]
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                />
                {errors["applicant_emergencyContactLastName"] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors["applicant_emergencyContactLastName"]}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="applicant_emergencyContactRelationship"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className={`w-full px-3 py-2.5 text-sm border ${
                    errors["applicant_emergencyContactRelationship"]
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Emergency Contact Phone Number
                </label>
                <input
                  type="tel"
                  id="applicant_emergencyContactPhone"
                  name="applicant_emergencyContactPhone"
                  value={formData.applicant.emergencyContactPhone}
                  minLength={10}
                  maxLength={15}
                  required
                  aria-required
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  pattern="[0-9\s\(\)\-\+]{10,15}"
                  className={`w-full px-3 py-2.5 text-sm border ${
                    errors["applicant_emergencyContactPhone"]
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
        </div>

        <div>
          <hr className="my-12" />
        </div>
        {/* Rental History */}
        <div className="space-y-6 px-4">
          <h5 className="font-semibold text-base text-gray-800 border-b border-gray-200 pb-2">
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
                  <AddressAutocomplete
                    id={addressFieldName}
                    name={addressFieldName}
                    value={item.address}
                    onChange={(value) => {
                      const syntheticEvent = {
                        target: { name: addressFieldName, value },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleChange(syntheticEvent);
                    }}
                    placeholder="Enter rental property address"
                    required={true}
                    error={errors[addressFieldName]}
                    label="Street Address"
                    onAddressSelect={(address) => {
                      // Auto-populate city, state, country, and postal code fields for this rental history entry
                      updateRentalAddressComponents(index, {
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postalCode: address.postalCode,
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={cityFieldName}
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[cityFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[stateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[countryFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[postalCodeFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[fromDateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      To Date
                    </label>
                    <input
                      type="date"
                      id={toDateFieldName}
                      name={toDateFieldName}
                      required
                      aria-required
                      value={item.toDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[toDateFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[landlordFirstNameFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className={`w-full px-3 py-2.5 text-sm border ${
                        errors[landlordLastNameFieldName]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Landlord's Phone No.
                  </label>
                  <input
                    type="tel"
                    required
                    aria-required
                    id={landlordPhoneFieldName}
                    name={landlordPhoneFieldName}
                    value={item.landlordPhone}
                    onChange={handleChange}
                    minLength={10}
                    maxLength={15}
                    placeholder="(555) 123-4567"
                    pattern="[0-9\s\(\)\-\+]{10,15}"
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors[landlordPhoneFieldName]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors[reasonForLeavingFieldName]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
        <div className="px-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Truth Confirmation
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            I confirm that all the information entered above is true to the best
            of my knowledge
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="truthConfirmation_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="truthConfirmation_name"
                name="truthConfirmation_name"
                type="text"
                value={formData.applicant.fullName}
                readOnly
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-600 ${
                  errors["truthConfirmation_name"]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors["truthConfirmation_name"] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors["truthConfirmation_name"]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="truthConfirmation_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date Signed
              </label>
              <input
                type="text"
                id="truthConfirmation_date"
                name="truthConfirmation_date"
                defaultValue={date}
                readOnly
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 bg-blue-600 text-white font-semibold text-base rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
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
