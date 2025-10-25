import crypto from "crypto";

/**
 * Decrypt an encrypted JWT secret
 * @param {string} encrypted - The encrypted hex string
 * @param {string} keyHex - The encryption key in hex format
 * @param {string} ivHex - The IV in hex format
 * @returns {string} The decrypted secret
 */
export function decryptSecret(encrypted, keyHex, ivHex) {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Decode a Base64 encoded secret
 * @param {string} base64Secret - The Base64 encoded secret
 * @returns {string} The decoded secret
 */
export function decodeBase64Secret(base64Secret) {
  return Buffer.from(base64Secret, "base64").toString("utf8");
}

// Example usage:
if (process.env.JWT_SECRET_ENCRYPTED && process.env.JWT_ENCRYPTION_KEY && process.env.JWT_ENCRYPTION_IV) {
  const secret = decryptSecret(
    process.env.JWT_SECRET_ENCRYPTED,
    process.env.JWT_ENCRYPTION_KEY,
    process.env.JWT_ENCRYPTION_IV
  );
  console.log("✅ JWT Secret decrypted successfully");
  // Use 'secret' for your JWT operations
} else if (process.env.JWT_SECRET_BASE64) {
  const secret = decodeBase64Secret(process.env.JWT_SECRET_BASE64);
  console.log("✅ JWT Secret decoded from Base64");
  // Use 'secret' for your JWT operations
} else {
  console.log("⚠️  Using plain JWT_SECRET from environment");
}
