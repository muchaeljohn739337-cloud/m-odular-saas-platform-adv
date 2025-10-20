import { Router } from "express";

const router = Router();

router.post("/qr", async (req, res) => {
  const { walletId, address, qrDataUrl, userId } = req.body || {};

  if (!walletId || !address || !qrDataUrl) {
    return res.status(400).json({ error: "walletId, address, and qrDataUrl are required." });
  }

  // TODO: persist encrypted recovery snapshots to secure storage.
  console.log("📦 Received recovery snapshot", {
    walletId,
    address,
    userId,
    length: typeof qrDataUrl === "string" ? qrDataUrl.length : null,
  });

  return res.status(201).json({ status: "stored" });
});

export default router;
