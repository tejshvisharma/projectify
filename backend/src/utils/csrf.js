import { doubleCsrf } from "csrf-csrf";
import dotenv from "dotenv";
dotenv.config();

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,

  getSessionIdentifier: (req) => {
  return req.user?._id || req.cookies.accessToken || "global-session";
},

  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: true,
  },

  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) => {
    const token = req.headers["x-csrf-token"];
    return Array.isArray(token) ? token[0] : token;
  },
});

export { generateCsrfToken, doubleCsrfProtection };
