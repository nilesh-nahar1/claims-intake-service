import { randomUUID } from "crypto";
import { query } from "../db/connection";
import { Claim, ClaimSubmission } from "../models/Claim";
import { findPolicyByNumber, findCustomerByEmail, isPolicyActive, hasSufficientCoverage } from "./policyService";
import { isWithinPolicyWindow } from "../utils/validation";
import { scoreClaimRisk, shouldFlagForFraudReview } from "./fraudDetectionService";

export class ClaimIntakeError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export async function submitClaim(submission: ClaimSubmission): Promise<Claim> {
  // NOTE: no retry/backoff here — a transient DB blip on either lookup fails
  // the whole submission. Acceptable for pilot volume, revisit before GA.
  const [policy, customer] = await Promise.all([
    findPolicyByNumber(submission.policyNumber),
    findCustomerByEmail(submission.customerEmail),
  ]);

  if (!policy) {
    throw new ClaimIntakeError("no policy found for policy number", "POLICY_NOT_FOUND");
  }

  if (!customer) {
    throw new ClaimIntakeError("no customer found for email", "CUSTOMER_NOT_FOUND");
  }

  if (!isPolicyActive(policy)) {
    throw new ClaimIntakeError("policy is not active", "POLICY_INACTIVE");
  }

  if (!isWithinPolicyWindow(submission.incidentDate, policy.effectiveDate, policy.expirationDate)) {
    throw new ClaimIntakeError("incident date falls outside policy coverage window", "OUTSIDE_COVERAGE_WINDOW");
  }

  if (!hasSufficientCoverage(policy, submission.estimatedAmount)) {
    throw new ClaimIntakeError("claim amount exceeds policy coverage limit", "COVERAGE_LIMIT_EXCEEDED");
  }

  const submittedAt = new Date().toISOString();
  const riskScore = scoreClaimRisk(
    { estimatedAmount: submission.estimatedAmount, incidentDate: submission.incidentDate, submittedAt },
    policy,
  );

  const claim: Claim = {
    id: randomUUID(),
    policyId: policy.id,
    customerId: customer.id,
    status: shouldFlagForFraudReview(riskScore) ? "flagged_fraud_review" : "under_review",
    incidentDate: submission.incidentDate,
    description: submission.description,
    estimatedAmount: submission.estimatedAmount,
    riskScore,
    submittedAt,
  };

  await query(
    `INSERT INTO claims (id, policy_id, customer_id, status, incident_date, description, estimated_amount, risk_score, submitted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      claim.id,
      claim.policyId,
      claim.customerId,
      claim.status,
      claim.incidentDate,
      claim.description,
      claim.estimatedAmount,
      claim.riskScore,
      claim.submittedAt,
    ],
  );

  return claim;
}

export async function getClaimById(id: string): Promise<Claim | null> {
  const rows = await query<Claim>("SELECT * FROM claims WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function advanceClaimStatus(id: string, status: Claim["status"]): Promise<void> {
  await query("UPDATE claims SET status = $1 WHERE id = $2", [status, id]);
}
