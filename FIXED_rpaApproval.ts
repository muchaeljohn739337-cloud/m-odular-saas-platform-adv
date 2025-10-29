// FIXED CODE for rpaApproval.ts

// FIX 1: Line 98 - Remove processedAt (doesn't exist in schema)
// BEFORE:
// data: {
//   status: "approved",
//   processedAt: new Date(),  // ❌ NOT IN SCHEMA
//   adminNotes: adminNotes || "Auto-approved by RPA (low risk)",
// },

// AFTER:
data: {
  status: "approved",
  approvedAt: new Date(),  // ✅ USE approvedAt instead
  adminNotes: adminNotes || "Auto-approved by RPA (low risk)",
},

// FIX 2: Line 113, 145, 256, 265 - Use cryptoAmount instead of amount
// BEFORE:
// amount: withdrawal.amount.toString(),  // ❌ NO 'amount' FIELD

// AFTER:
amount: withdrawal.cryptoAmount.toString(),  // ✅ USE cryptoAmount

// FIX 3: Line 229 - Same as FIX 1
// BEFORE:
// processedAt: new Date(),

// AFTER:
approvedAt: new Date(),
