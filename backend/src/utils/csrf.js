import { doubleCsrf } from "csrf-csrf";

const isProd = process.env.NODE_ENV === "production";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret) throw new Error("CSRF_SECRET is not set");
    return secret;
  },

  // ✅ THE FIX: refreshToken is present at both generation AND validation time.
  // It doesn't depend on req.user, so middleware order doesn't matter.
  // It's stable across the session (doesn't rotate every 15 min like accessToken).
  getSessionIdentifier: (req) => {
    return req.cookies?.refreshToken ?? "anonymous";
  },

  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // ← was "true" hardcoded before, breaks localhost
    path: "/",
  },

  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) => {
    const token = req.headers["x-csrf-token"];
    return Array.isArray(token) ? token[0] : token;
  },
});

export { generateCsrfToken, doubleCsrfProtection };
