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
  refreshAccessToken,
  changeCurrentPassword,
  updateProfile,
  updateAvatar,
} from "../controllers/auth.controllers.js";

import {
  userRegistrationValidator,
  resendVerificationValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userChangeCurrentPasswordValidator,
  updateProfileValidator
} from "../validators/auth.validators.js";

import { uploadAvatar } from "../middlewares/upload.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register")
    .post(userRegistrationValidator(), validate, registerUser);

router
  .route("/verify-email")
  .post([query("token").isString().trim().notEmpty()], validate, verifyEmail);

router
  .route("/resend-verification")
  .post(resendVerificationValidator(), validate, resendEmailVerification);

router.route("/login").post(userLoginValidator(), loginUser);


router.route("/logout").post(isLoggedIn, logoutUser);

router.route("/profile").get( isLoggedIn, getCurrentUser);  

router
  .route("/change-password")
  .post(userChangeCurrentPasswordValidator(), validate, isLoggedIn, changeCurrentPassword); 

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
  
router
  .route("/reset-password")
  .post(userResetForgottenPasswordValidator(), validate, resetForgottenPassword);


router.route("/refresh-token").post(refreshAccessToken);

router.patch(
  "/update-profile",
  isLoggedIn,
  updateProfileValidator(),
  validate,
  updateProfile,
);

router.patch(
  "/update-avatar",
  isLoggedIn,
  uploadAvatar.single("avatar"),
  updateAvatar,
);
  export default router

