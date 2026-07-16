# claims-intake-service

Internal microservice for ingesting, validating, and triaging insurance claims
submitted through the policyholder portal and partner APIs.

## What it does

- Accepts new claim submissions (`POST /claims`) and validates them against
  the policyholder's active policy.
- Runs a lightweight fraud-risk pass before a claim is handed off to the
  adjuster queue.
- Exposes policy and customer lookups used by the intake flow.
- Persists claims, policies, and customers to Postgres via a small
  connection/model layer (no ORM — hand-rolled queries).

## Service layout

```
src/
  index.ts                     # Express app bootstrap
  routes/
    claims.ts                  # /claims endpoints
    policies.ts                # /policies endpoints
  services/
    claimsService.ts           # claim intake + status transitions
    policyService.ts           # policy lookup + coverage checks
    fraudDetectionService.ts   # rules-based risk scoring
  models/
    Claim.ts
    Policy.ts
    Customer.ts
  db/
    connection.ts              # pg pool setup
  middleware/
    auth.ts                    # partner API key auth
  utils/
    validation.ts
tests/
  claimsService.test.ts
```

## Running locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Known gaps / open work

- Fraud scoring thresholds are hardcoded in `fraudDetectionService.ts` —
  should move to config once underwriting signs off on values.
- No retry/backoff on the policy lookup call in `claimsService.ts`.
- `policies.ts` has no pagination on the list endpoint yet.
