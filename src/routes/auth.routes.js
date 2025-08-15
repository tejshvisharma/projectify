import { Router } from "express";
import { query } from "express-validator";
import {
  registerUser,
  verifyEmail,
  resendEmailVerification,
} from "../controllers/auth.controllers.js";
import {
  userRegistrationValidator,
  resendVerificationValidator,
} from "../validators/auth.validators.js";
import { validate } from "../middlewares/validate.middleware.js";
const router = Router();

router.route("/register")
    .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/verify-email")
  .get([query("token").isString().trim().notEmpty()], validate, verifyEmail);

router
  .route("/resend-verification")
  .post(resendVerificationValidator(), validate, resendEmailVerification);
export default router
