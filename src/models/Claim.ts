export type ClaimStatus =
  | "submitted"
  | "under_review"
  | "pending_adjuster"
  | "approved"
  | "denied"
  | "flagged_fraud_review";

export interface Claim {
  id: string;
  policyId: string;
  customerId: string;
  status: ClaimStatus;
  incidentDate: string;
  description: string;
  estimatedAmount: number;
  riskScore: number | null;
  submittedAt: string;
}

export interface ClaimSubmission {
  policyNumber: string;
  customerEmail: string;
  incidentDate: string;
  description: string;
  estimatedAmount: number;
}
