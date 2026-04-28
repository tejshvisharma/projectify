import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import devLogger from "./middlewares/devLogger.middleware.js";
import { uploadErrorHandler } from "./middlewares/upload.middleware.js";

// Routers
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import commentRouter from "./routes/comment.routes.js";
import SubTaskRouter from "./routes/subTask.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import userRouter from "./routes/user.routes.js";
import projectInviteRouter from "./routes/projectInvite.routes.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ─── 1. Trust Proxy (Required for Render / any reverse proxy host) ───────────
app.set("trust proxy", 1);

// ─── 2. Security Headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL,
          process.env.BASE_URL,
        ].filter(Boolean),
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// ─── 3. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(!isProduction ? ["http://localhost:5173", "http://localhost:3000"] : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-csrf-token"],
  }),
);

// ─── 4. Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── 5. Dev-only Middleware ───────────────────────────────────────────────────
if (!isProduction) {
  app.use(devLogger);
}

// ─── 6. Static Files ─────────────────────────────────────────────────────────
app.use(express.static("public"));

// ─── 7. Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subtasks", SubTaskRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/invites", projectInviteRouter);

// ─── 8. Error Handlers (always last) ─────────────────────────────────────────
app.use(uploadErrorHandler);
app.use(errorHandler);

export default app;
