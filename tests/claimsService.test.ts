import { scoreClaimRisk, shouldFlagForFraudReview } from "../src/services/fraudDetectionService";
import { Policy } from "../src/models/Policy";

const basePolicy: Policy = {
  id: "policy-1",
  customerId: "customer-1",
  policyNumber: "POL-100200",
  type: "auto",
  status: "active",
  coverageLimit: 20000,
  deductible: 500,
  effectiveDate: "2026-01-01",
  expirationDate: "2026-12-31",
};

describe("fraudDetectionService", () => {
  it("scores a low-risk claim below the flag threshold", () => {
    const score = scoreClaimRisk(
      { estimatedAmount: 1500, incidentDate: "2026-06-10", submittedAt: "2026-06-11T00:00:00.000Z" },
      basePolicy,
    );

    expect(shouldFlagForFraudReview(score)).toBe(false);
  });

  it("flags a claim filed just after policy start with a high, round amount", () => {
    const score = scoreClaimRisk(
      { estimatedAmount: 19000, incidentDate: "2026-01-10", submittedAt: "2026-01-30T00:00:00.000Z" },
      basePolicy,
    );

    expect(shouldFlagForFraudReview(score)).toBe(true);
  });
});
