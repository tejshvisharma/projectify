import express from "express"
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
// all middlewares :
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin:  [process.env.BASE_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization","Accept"],
    exposedHeaders: ["Set-Cookie", "*"]
  })
);
app.use(express.static("public"));
// Routers import
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import commentRouter from "./routes/comment.routes.js";
import SubTaskRouter from "./routes/subTask.routes.js";






app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subtasks", SubTaskRouter);














app.use(errorHandler);

export default app;