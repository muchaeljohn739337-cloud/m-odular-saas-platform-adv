import { parseConfig } from "./schema";

// Parse and validate configuration
const config = parseConfig();

export default config;

// Legacy exports for backward compatibility

/**
 * @deprecated Use config.database.url instead
 */
export const DATABASE_URL = config.database.url;

/**
 * @deprecated Use config.database.ssl instead
 */
export const DATABASE_SSL = config.database.ssl;

/**
 * @deprecated Use config.database.pool.min instead
 */
export const DATABASE_POOL_MIN = config.database.pool.min;

/**
 * @deprecated Use config.database.pool.max instead
 */
export const DATABASE_POOL_MAX = config.database.pool.max;

/**
 * @deprecated Use config.server.port instead
 */
export const PORT = config.server.port;

/**
 * @deprecated Use config.server.host instead
 */
export const HOST = config.server.host;

/**
 * @deprecated Use config.server.cors.origins instead
 */
export const CORS_ORIGINS = config.server.cors.origins;

/**
 * @deprecated Use config.auth.jwtSecret instead
 */
export const JWT_SECRET = config.auth.jwtSecret;

/**
 * @deprecated Use config.auth.jwtExpiresIn instead
 */
export const JWT_EXPIRES_IN = config.auth.jwtExpiresIn;

/**
 * @deprecated Use config.auth.refreshTokenExpiresIn instead
 */
export const REFRESH_TOKEN_EXPIRES_IN = config.auth.refreshTokenExpiresIn;

/**
 * @deprecated Use config.auth.passwordSaltRounds instead
 */
export const PASSWORD_SALT_ROUNDS = config.auth.passwordSaltRounds;

/**
 * @deprecated Use config.redis.url instead
 */
export const REDIS_URL = config.redis.url;

/**
 * @deprecated Use config.redis.ttl instead
 */
export const REDIS_TTL = config.redis.ttl;

/**
 * @deprecated Use config.redis.prefix instead
 */
export const REDIS_PREFIX = config.redis.prefix;

/**
 * @deprecated Use config.sentry.dsn instead
 */
export const SENTRY_DSN = config.sentry.dsn;

/**
 * @deprecated Use config.sentry.environment instead
 */
export const SENTRY_ENVIRONMENT = config.sentry.environment;

// Legacy functions for backward compatibility

/**
 * Get JWT secret from environment with support for encrypted values
 * @deprecated Use config.auth.jwtSecret instead
 */
export function getJwtSecret(): string {
  return config.auth.jwtSecret;
}

/**
 * Get allowed CORS origins
 * @deprecated Use config.server.cors.origins instead
 */
export function getAllowedOrigins(): string[] {
  return config.server.cors.origins;
  // Also check for specific Vercel deployment URL pattern
  if (frontendUrl.includes("vercel.app")) {
    set.add(frontendUrl);
  }

  // Add localhost variants for development
  if (process.env.NODE_ENV !== "production") {
    ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"].forEach((o) =>
      set.add(o)
    );
  }

  // Merge explicit ALLOWED_ORIGINS env (comma-separated)
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    envOrigins
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((o) => set.add(o));
  }

  return [...set];
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  allowedOrigins: getAllowedOrigins(),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: getJwtSecret(),
  jwtExpiration: process.env.JWT_EXPIRATION || "7d",
  sessionSecret: process.env.SESSION_SECRET || getJwtSecret(),
  nodeEnv: process.env.NODE_ENV || "development",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

// Validate required configuration
if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required in environment variables");
}

console.log("🔧 Configuration loaded successfully");
console.log(`   Port: ${config.port}`);
console.log(`   Environment: ${config.nodeEnv}`);
console.log(`   Frontend URL: ${config.frontendUrl}`);
console.log(`   Allowed CORS Origins: ${config.allowedOrigins.join(", ")}`);
if (!config.stripeSecretKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY not set. Payment endpoints will be disabled.");
}
