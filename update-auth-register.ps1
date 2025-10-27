# Script to update auth.ts with registration approval workflow
$filePath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend\src\routes\auth.ts"

# Read the entire file
$content = Get-Content $filePath -Raw

# Find the starting point: "// POST /api/auth/register"
$startMarker = "// POST /api/auth/register"
$startIdx = $content.IndexOf($startMarker)

if ($startIdx -eq -1) {
    Write-Host "ERROR: Could not find registration endpoint marker" -ForegroundColor Red
    exit 1
}

# Find the end of the register endpoint (next "// POST /api/auth/" or "router.post" that's not part of this endpoint)
$endMarker = "// POST /api/auth/login"
$endIdx = $content.IndexOf($endMarker, $startIdx)

if ($endIdx -eq -1) {
    Write-Host "ERROR: Could not find next endpoint marker" -ForegroundColor Red
    exit 1
}

# Extract the old endpoint
$oldEndpoint = $content.Substring($startIdx, $endIdx - $startIdx)
Write-Host "Found registration endpoint (lines $startIdx-$endIdx)" -ForegroundColor Green

# New endpoint with approval workflow
$newEndpoint = @'
// POST /api/auth/register - NOW WITH ADMIN APPROVAL WORKFLOW
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
    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split("@")[0],
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        active: false, // ✨ NEW: Set to pending approval
      },
    });

    // ✨ NEW: Notify admins of pending registration
    try {
      await notifyAllAdmins({
        type: "all",
        category: "admin",
        title: "New User Registration - Pending Approval",
        message: `User ${email} (${firstName} ${lastName}) has registered and is awaiting approval.`,
        priority: "high",
        data: { userId: user.id, email, firstName, lastName },
      });
    } catch (notifyErr) {
      console.error("Failed to notify admins of registration:", notifyErr);
      // Continue anyway - notification failure shouldn't block registration
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    // ✨ CHANGED: Updated response message and added status field
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

'@

# Replace the endpoint
$newContent = $content.Substring(0, $startIdx) + $newEndpoint + $content.Substring($endIdx)

# Write back
Set-Content $filePath $newContent -Encoding UTF8
Write-Host "✅ Registration endpoint updated successfully!" -ForegroundColor Green
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "  • Set active: false for new users (pending approval)" -ForegroundColor Yellow
Write-Host "  • Added admin notification on registration" -ForegroundColor Yellow
Write-Host "  • Updated response message and added status field" -ForegroundColor Yellow
