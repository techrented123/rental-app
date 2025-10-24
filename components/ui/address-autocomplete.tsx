"use client";
import { useCallback, useRef } from "react";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { AlertCircle } from "lucide-react";

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface AddressAutocompleteProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  restrictToCanada?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  name,
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  className = "",
  error,
  disabled = false,
  label,
  required = false,
  restrictToCanada = false,
}) => {
  interface InputRef extends HTMLInputElement {
    getPlaces: () => any;
  }
  const inputRef = useRef<InputRef | null>();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
    region: "ca",
  });

  // Canadian postal code validation
  const isValidCanadianPostalCode = (postalCode: string): boolean => {
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalCodeRegex.test(postalCode);
  };

  // Canadian province validation
  const isValidCanadianProvince = (province: string): boolean => {
    const canadianProvinces = [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon",
    ];
    return canadianProvinces.includes(province);
  };

  const handleOnPlacesChanged = useCallback(() => {
    let address;
    if (inputRef.current) {
      address = inputRef.current?.getPlaces();
    }

    if (!address || !address[0]) return;

    const addressComponents = address[0].address_components;
    let city = "";
    let state = "";
    let postalCode = "";
    let street_address = "";
    let country = "";

    addressComponents.forEach(
      (address: { types: string | string[]; long_name: string }) => {
        if (address.types.includes("street_number")) {
          street_address += address.long_name;
        }
        if (address.types.includes("route")) {
          street_address += " " + address.long_name;
        }
        if (address.types.includes("locality")) {
          city = address.long_name;
        } else if (address.types.includes("administrative_area_level_1")) {
          state = address.long_name;
        } else if (address.types.includes("postal_code")) {
          postalCode = address.long_name;
        } else if (address.types.includes("country")) {
          country = address.long_name;
        }
      }
    );

    // Only apply Canadian restrictions if restrictToCanada is true
    if (restrictToCanada) {
      // Validate that this is a Canadian address
      if (country !== "Canada" && country !== "CA") {
        alert("Please select a Canadian address only.");
        return;
      }

      // Validate Canadian postal code format
      if (postalCode && !isValidCanadianPostalCode(postalCode)) {
        alert(
          "Please select a valid Canadian address with proper postal code."
        );
        return;
      }
    }

    // Update the main address field
    onChange(street_address);

    // Call the onAddressSelect callback with parsed address
    if (onAddressSelect) {
      onAddressSelect({
        street: street_address,
        city: city,
        state: state,
        country: country,
        postalCode: postalCode,
      });
    }
  }, [onChange, onAddressSelect, restrictToCanada]);

  const loadHandler = useCallback((ref: any) => {
    inputRef.current = ref;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputElement = (
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-required={required}
      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        error ? "border-red-500" : "border-gray-300"
      } ${className}`}
    />
  );

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}

      {!isLoaded ? (
        <div>
          {inputElement}
          <p className="text-xs text-gray-500 mt-1">Loading Google Maps...</p>
        </div>
      ) : (
        <StandaloneSearchBox
          onLoad={loadHandler}
          onPlacesChanged={handleOnPlacesChanged}
        >
          {inputElement}
        </StandaloneSearchBox>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
