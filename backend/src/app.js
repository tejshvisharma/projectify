import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import devLogger from "./middlewares/devLogger.middleware.js";

const app = express();

// Security headers (helmet) - must be before routes, after express init
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP to avoid breaking React/Vite
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(devLogger);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BASE_URL,
  "http://localhost:3000",
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-csrf-token"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.static("public"));
// Routers import
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import commentRouter from "./routes/comment.routes.js";
import SubTaskRouter from "./routes/subTask.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import userRouter from "./routes/user.routes.js";
import projectInviteRouter from "./routes/projectInvite.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subtasks", SubTaskRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/invites", projectInviteRouter);

app.use(errorHandler);

export default app;
