export type PolicyType = "auto" | "home" | "renters" | "umbrella";

export type PolicyStatus = "active" | "lapsed" | "cancelled" | "pending_renewal";

export interface Policy {
  id: string;
  customerId: string;
  policyNumber: string;
  type: PolicyType;
  status: PolicyStatus;
  coverageLimit: number;
  deductible: number;
  effectiveDate: string;
  expirationDate: string;
}
