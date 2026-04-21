import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { acceptProjectInvite } from "../controllers/projectInvite.controller.js";
import { acceptProjectInviteValidator } from "../validators/projectInvite.validators.js";

const router = Router();

router
  .route("/:token/accept")
  .post(
    isLoggedIn,
    acceptProjectInviteValidator(),
    validate,
    acceptProjectInvite,
  );

export default router;
