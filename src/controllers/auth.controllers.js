import { Mongoose } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import  User  from "../models/user.models.js";
import { 
    emailVerificationMailGenContent, 
    forgetPasswordMailGenContent, 
    sendEmail} from "../utils/mail.js";

import  ApiResponse  from "../utils/api-response.js"

import  dotenv  from "dotenv";
import ApiError from "../utils/api-error.js";
    dotenv.config({ path: "C:/Users/ojshv/OneDrive/Desktop/projectify/.env" });


const registerUser = asyncHandler( async (req, res) => {
  console.log("Post request arrived successfully at register user url");
  const { email, username, password, fullName } = req.body;

  //validation done in middleware, after that

  //   create newUSer in DB
  const user = await User.create({
    username: username,
    email: email,
    password: password,
    fullName: fullName,
    isEmailVerified: false,
  });

  // Generate verification token
  const { hashedToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

    //set token to database :
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    // save the user in DB
    user.save();

    // send verification email to user
    const emailVerificationUrl = `http://localhost:${process.env.PORT}/api/v1/auth/verify-email?token=${unHashedToken}`;
    const mailContent = emailVerificationMailGenContent(
      user.username,
      emailVerificationUrl
    );

     sendEmail({
       subject: "To verify Email",
       to: user.email,
       mailGenContent: mailContent,
     });
    
    // send response after success 
    const response = new ApiResponse(200, null, "✅ user registered successfully, check your email for verification");
    return res.status(response.statuscode).json(response);
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const logoutUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation done in middleware after that 


});

const verifyEmail = asyncHandler(async (req, res) => {
  
  const incomingToken = String(req.query.token || "").trim();
  if (!incomingToken) {
    throw new ApiError(400, "Token is required");
  }
  

  // hash the incoming token
  const hashedIncoming = crypto
    .createHash("sha256")
    .update(incomingToken)
    .digest("hex");

  // find matching user
  const user = await User.findOne({
    emailVerificationToken: hashedIncoming,
  });

  if (!user) {
    throw new ApiError(400, "Invalid verification link");
  }

  // expired?
  if (
    user.emailVerificationExpiry &&
    user.emailVerificationExpiry < new Date()
  ) {
    throw new ApiError(410, "Verification link has expired");
  }

  // already verified?
  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email already verified"));
  }

  // verify + clear token
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "✅ Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  if (user.isEmailVerified) {
    return next(new ApiError(400, "Email already verified"));
  }

  // Generate new verification token
  const { hashedToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  const emailVerificationUrl = `http://localhost:${process.env.PORT}/api/v1/auth/verify-email?token=${unHashedToken}`;
  const mailContent = emailVerificationMailGenContent(
    user.username,
    emailVerificationUrl,
  );

  await sendEmail({
    subject: "Verify Your Email",
    to: user.email,
    mailGenContent: mailContent,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Verification email resent. Please check your inbox.",
      ),
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
