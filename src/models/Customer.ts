export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  // Used for identity verification during claim intake. Stored encrypted at
  // rest — never log or return this field in full via the API.
  ssn: string;
  createdAt: string;
}
