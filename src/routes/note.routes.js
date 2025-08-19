import { Router } from "express";
import userRolesEnum from "../utils/constants.js"
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/:projectId")
  .get(getNotes)
  .post(isLoggedIn,validateProjectPermission([userRolesEnum.ADMIN]), createNote);

export default router