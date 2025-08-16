import { Router } from "express";
import { query } from "express-validator";
import {
  registerUser,
  verifyEmail,
  resendEmailVerification,
  logoutUser,
  loginUser,
  getCurrentUser,
  resetForgottenPassword,
  forgotPasswordRequest,
} from "../controllers/auth.controllers.js";

import {
  userRegistrationValidator,
  resendVerificationValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator
  
} from "../validators/auth.validators.js";

import { validate } from "../middlewares/validate.middleware.js";

import isLoggedIn from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register")
    .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/verify-email")
  .get([query("token").isString().trim().notEmpty()], validate, verifyEmail);

router
  .route("/resend-verification")
  .post(resendVerificationValidator(), validate, resendEmailVerification);

router.route("/login").post(userLoginValidator(), loginUser);


router.route("/logout").post(isLoggedIn, logoutUser);

router.route("/profile").get( isLoggedIn, getCurrentUser);  

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
  
router
  .route("/reset-password")
  .post(userResetForgottenPasswordValidator(), validate, resetForgottenPassword);



  export default router

