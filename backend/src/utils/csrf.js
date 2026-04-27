import { doubleCsrf } from "csrf-csrf";
import dotenv from "dotenv";
dotenv.config();

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,

  getSessionIdentifier: (req) => `session-${req.ip}`,

  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },

  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) => {
    const token = req.headers["x-csrf-token"];
    return Array.isArray(token) ? token[0] : token;
  },
});

export { generateCsrfToken, doubleCsrfProtection };
