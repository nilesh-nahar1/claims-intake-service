import { query } from "../db/connection";
import { Policy } from "../models/Policy";
import { Customer } from "../models/Customer";

export async function findPolicyByNumber(policyNumber: string): Promise<Policy | null> {
  const rows = await query<Policy>("SELECT * FROM policies WHERE policy_number = $1", [policyNumber]);
  return rows[0] ?? null;
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const rows = await query<Customer>("SELECT * FROM customers WHERE email = $1", [email]);
  return rows[0] ?? null;
}

export function isPolicyActive(policy: Policy): boolean {
  return policy.status === "active";
}

export function hasSufficientCoverage(policy: Policy, claimAmount: number): boolean {
  return claimAmount <= policy.coverageLimit;
}
