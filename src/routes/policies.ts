import { Router } from "express";
import { findPolicyByNumber } from "../services/policyService";

export const policiesRouter = Router();

// TODO: no pagination — fine while partners only look up single policies,
// revisit if we add a bulk lookup endpoint.
policiesRouter.get("/:policyNumber", async (req, res) => {
  const policy = await findPolicyByNumber(req.params.policyNumber);

  if (!policy) {
    return res.status(404).json({ error: "policy not found" });
  }

  return res.json(policy);
});
