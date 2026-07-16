import express from "express";
import dotenv from "dotenv";
import { claimsRouter } from "./routes/claims";
import { policiesRouter } from "./routes/policies";
import { requirePartnerApiKey } from "./middleware/auth";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/claims", requirePartnerApiKey, claimsRouter);
app.use("/policies", requirePartnerApiKey, policiesRouter);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`claims-intake-service listening on port ${port}`);
});
