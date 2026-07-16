import { Request, Response, NextFunction } from "express";

export function requirePartnerApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-partner-api-key");

  if (!key || key !== process.env.PARTNER_API_KEY) {
    return res.status(401).json({ error: "invalid or missing partner API key" });
  }

  next();
}
