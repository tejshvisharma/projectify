import { Router } from "express";
import PROJECT_ROLES from "../utils/constants.js";
import { isLoggedIn, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

export default router