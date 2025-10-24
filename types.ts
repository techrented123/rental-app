export type Appointment = {
  name: string;
  email: string;
  message: string;
};

export interface ApplicantInfo {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  emergencyContactFirstName: string;
  emergencyContactLastName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export interface RentalHistoryEntry {
  id: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landlordPhone: string;
  landlordFirstName: string;
  landlordLastName: string;
  fromDate: string;
  toDate: string;
  reasonForLeaving: string;
}

export interface ApplicationFormInfo {
  applicant: ApplicantInfo;
  rentalHistory: RentalHistoryEntry[];
}
