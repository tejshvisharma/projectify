import { Router } from "express";
import { userRolesEnum, PROJECT_ROLES } from "../utils/constants.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/:projectId")
  .get(isLoggedIn, validateProjectPermission([PROJECT_ROLES.VIEWERS]), getNotes)
  .post(
    isLoggedIn,
    validateProjectPermission([PROJECT_ROLES.EDITORS]),
    createNote,
  );

export default router