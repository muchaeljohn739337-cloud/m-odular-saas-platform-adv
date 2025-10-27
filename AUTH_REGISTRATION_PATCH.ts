// UPDATED: POST /api/auth/register - With Admin Approval Workflow
// File: backend/src/routes/auth.ts (Lines 35-90)

router.post("/register", validateApiKey, async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
      select: { id: true },
    });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ✨ CHANGE: Create user with active: false (pending admin approval)
    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split("@")[0],
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        active: false, // ← PENDING APPROVAL (NEW)
      },
    });

    // ✨ CHANGE: Notify admins of pending registration
    try {
      await notifyAllAdmins({
        type: "all",
        category: "admin",
        title: "New User Registration - Pending Approval",
        message: `User ${email} (${firstName} ${lastName}) has registered and is awaiting approval.`,
        priority: "high",
        data: {
          userId: user.id,
          email: user.email,
          firstName: firstName || "",
          lastName: lastName || "",
        },
      });
    } catch (notifyErr) {
      console.error("Failed to notify admins:", notifyErr);
      // Don't fail registration if notification fails
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    // ✨ CHANGE: Response includes pending_approval status
    return res.status(201).json({
      message: "Registration submitted. Awaiting admin approval.",
      status: "pending_approval",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});
