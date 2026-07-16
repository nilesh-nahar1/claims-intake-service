import { z } from "zod";

export const claimSubmissionSchema = z.object({
  policyNumber: z.string().min(6),
  customerEmail: z.string().email(),
  incidentDate: z.string().date(),
  description: z.string().min(10).max(2000),
  estimatedAmount: z.number().positive().max(1_000_000),
});

export function isWithinPolicyWindow(incidentDate: string, effectiveDate: string, expirationDate: string): boolean {
  const incident = new Date(incidentDate).getTime();
  return incident >= new Date(effectiveDate).getTime() && incident <= new Date(expirationDate).getTime();
}
