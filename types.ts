export type Appointment = {
  name: string;
  email: string;
  message: string;
};

export interface ProspectInfo {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  dob: string;
  state: string;
  city2: string | undefined;
  state2: string | undefined;
  lengthOfStay: "yes" | "no";
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
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

export interface BackgroundCheckResult {
  id: string;
  timestamp: string;
  prospect: ProspectInfo;
  newsArticles: {
    found: boolean;
    articles: Array<{
      title: string;
      date: string;
      source: string;
      summary: string;
    }>;
  };
  legalAppearances: {
    found: boolean;
    cases: Array<{
      caseNumber: string;
      date: string;
      court: string;
      type: string;
      status: string;
    }>;
    recommendation: string;
  };
  socialMedia: {
    found: boolean;
    profiles: Array<{
      platform: string;
      url: string;
      summary: string;
    }>;
    recommendation: string;
  };
  businessAssociations: {
    found: boolean;
    companies: Array<{
      name: string;
      role: string;
      status: string;
      registrationDate: string;
    }>;
    recommendation: string;
  };
  onlineActivity: {
    found: boolean;
    details: string;
    recommendation: string;
  };
  riskLevel: "low" | "medium" | "high";
  overallRecommendation: string;
}
