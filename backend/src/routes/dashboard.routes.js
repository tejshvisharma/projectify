import { Router } from "express";
import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { PROJECT_ROLES } from "../utils/constants.js";
import {
  getDashboardSummary,
  getUserDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router
  .route("/dashboard/me")
  .get(isLoggedIn, getUserDashboard);

router
  .route("/projects/:projectId/dashboard/summary")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getDashboardSummary,
  );

export default router;
