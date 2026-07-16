import { Claim } from "../models/Claim";
import { Policy } from "../models/Policy";

// TODO(underwriting): these weights and the 72 threshold were set during the
// initial pilot and never revisited. Move to config once underwriting signs
// off on final values — see README "Known gaps".
const RECENT_POLICY_WEIGHT = 25;
const HIGH_AMOUNT_WEIGHT = 30;
const LATE_REPORTING_WEIGHT = 20;
const ROUND_NUMBER_WEIGHT = 10;
const FRAUD_RISK_THRESHOLD = 72;

export function scoreClaimRisk(claim: Pick<Claim, "estimatedAmount" | "incidentDate" | "submittedAt">, policy: Policy): number {
  let score = 0;

  const policyAgeDays = daysBetween(policy.effectiveDate, claim.incidentDate);
  if (policyAgeDays < 30) {
    score += RECENT_POLICY_WEIGHT;
  }

  if (claim.estimatedAmount >= policy.coverageLimit * 0.9) {
    score += HIGH_AMOUNT_WEIGHT;
  }

  const reportingDelayDays = daysBetween(claim.incidentDate, claim.submittedAt);
  if (reportingDelayDays > 14) {
    score += LATE_REPORTING_WEIGHT;
  }

  if (claim.estimatedAmount % 1000 === 0) {
    score += ROUND_NUMBER_WEIGHT;
  }

  return score;
}

export function shouldFlagForFraudReview(riskScore: number): boolean {
  return riskScore >= FRAUD_RISK_THRESHOLD;
}

function daysBetween(earlier: string, later: string): number {
  const ms = new Date(later).getTime() - new Date(earlier).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
