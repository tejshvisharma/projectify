import dotenv from "dotenv";
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
export const validateEnv = () => {
  const required = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "PORT",
    "NODE_ENV",
    "FRONTEND_URL",
    "BASE_URL",
    "EMAIL_RESEND_COOLDOWN_MS",
    "EMAIL_RESEND_MAX_PER_DAY",
    "CSRF_SECRET",
    "EMAIL_FROM",
    "RESEND_API_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",

  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // Validate token secrets are sufficiently long
  if (process.env.ACCESS_TOKEN_SECRET.length < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must be at least 32 characters long");
  }

  if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error("REFRESH_TOKEN_SECRET must be at least 32 characters long");
  }

  console.log("✅ Environment variables validated successfully");
};
