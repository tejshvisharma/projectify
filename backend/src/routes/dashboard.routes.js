import { Router } from "express";
import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { PROJECT_ROLES } from "../utils/constants.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const router = Router();

router
  .route("/:projectId/dashboard/summary")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getDashboardSummary,
  );

export default router;
