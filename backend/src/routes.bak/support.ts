import express, { Request, Response } from "express";
const router = express.Router();

// 🧰 Example support route
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Support route working properly ✅" });
});

router.post("/contact", (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  res.json({ success: true, msg: "Support ticket created successfully" });
});

export default router;