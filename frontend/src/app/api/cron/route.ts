import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("🔄 Cron job executed at:", new Date().toISOString());

    // Example cron job tasks:
    // 1. Health check
    // 2. Database cleanup
    // 3. Send scheduled notifications
    // 4. Update cached data
    // 5. Process queued tasks

    // Example: Call backend health check
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const healthResponse = await fetch(`${backendUrl}/api/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!healthResponse.ok) {
          console.warn("⚠️ Backend health check failed during cron job");
        } else {
          console.log("✅ Backend health check passed");
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not reach backend during cron job:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Add your custom cron logic here
    // Examples:
    // - Clean up old sessions
    // - Send daily reports
    // - Process pending transactions
    // - Update analytics data

    res.status(200).json({
      message: "Hello Cron!",
      timestamp: new Date().toISOString(),
      status: "success",
      executed: true,
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    res.status(500).json({
      error: "Cron job failed",
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
