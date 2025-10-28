const fs = require('fs');
let content = fs.readFileSync('src/routes/auth.ts', 'utf8');

// Remove the duplicate forgot-password and reset-password routes that use Prisma passwordResetToken
const startMarker = 'router.post("/forgot-password", async (req, res) => {';
const endMarker = '});

export default router;';

const startIndex = content.lastIndexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  const fixed = before + '// Password reset routes removed - use Redis-based implementation earlier in file\n\n' + after;
  fs.writeFileSync('src/routes/auth.ts', fixed);
  console.log('✅ Removed duplicate password reset routes');
} else {
  console.log('❌ Could not find routes to remove');
}
