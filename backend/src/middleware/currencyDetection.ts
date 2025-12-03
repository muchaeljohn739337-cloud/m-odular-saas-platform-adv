import { NextFunction, Request, Response } from "express";
import CurrencyService from "../services/CurrencyService";

/**
 * Middleware to detect user's currency from IP address
 * Attaches currency information to req object
 */
export interface CurrencyRequest extends Request {
  detectedCurrency?: string;
  detectedCountry?: string;
}

export const detectCurrency = (req: CurrencyRequest, res: Response, next: NextFunction): void => {
  try {
    // Get IP address from request
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    // Skip detection for localhost/development
    if (ipAddress === "::1" || ipAddress === "127.0.0.1" || ipAddress.startsWith("192.168.")) {
      req.detectedCurrency = "USD"; // Default for localhost
      req.detectedCountry = "US";
      return next();
    }

    // Detect currency from IP
    const currency = CurrencyService.detectCurrencyFromIP(ipAddress);
    const country = CurrencyService.getCountryFromIP(ipAddress);

    req.detectedCurrency = currency;
    req.detectedCountry = country || "US";

    next();
  } catch (error) {
    // On error, default to USD and continue
    console.error("Currency detection error:", error);
    req.detectedCurrency = "USD";
    req.detectedCountry = "US";
    next();
  }
};

export default detectCurrency;
