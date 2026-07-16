import { Router } from "express";
import { claimSubmissionSchema } from "../utils/validation";
import { submitClaim, getClaimById, ClaimIntakeError } from "../services/claimsService";

export const claimsRouter = Router();

claimsRouter.post("/", async (req, res) => {
  const parsed = claimSubmissionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "invalid claim submission", details: parsed.error.flatten() });
  }

  try {
    const claim = await submitClaim(parsed.data);
    return res.status(201).json(claim);
  } catch (err) {
    if (err instanceof ClaimIntakeError) {
      return res.status(422).json({ error: err.message, code: err.code });
    }
    return res.status(500).json({ error: "unexpected error submitting claim" });
  }
});

claimsRouter.get("/:id", async (req, res) => {
  const claim = await getClaimById(req.params.id);

  if (!claim) {
    return res.status(404).json({ error: "claim not found" });
  }

  return res.json(claim);
});
