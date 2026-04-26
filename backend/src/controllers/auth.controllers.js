import { Mongoose } from "mongoose";

import { asyncHandler } from "../utils/async-handler.js";

import User from "../models/user.models.js";
import {
  emailVerificationMailGenContent,
  forgetPasswordMailGenContent,
  sendEmail,
} from "../utils/mail.js";

import ApiResponse from "../utils/api-response.js";

import dotenv from "dotenv";

import ApiError from "../utils/api-error.js";
import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";

import crypto from "crypto";

import { json } from "express";

import cloudinary from "../config/cloudinary.js";

dotenv.config();

const registerUser = asyncHandler(async (req, res) => {
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
  const emailVerificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${unHashedToken}`;
  const mailContent = emailVerificationMailGenContent(
    user.username,
    emailVerificationUrl,
  );

  await sendEmail({
    subject: "To verify Email",
    to: user.email,
    mailGenContent: mailContent,
  });

  // send response after success
  const response = new ApiResponse(
    200,
    null,
    "✅ user registered successfully, check your email for verification",
  );
  return res.status(response.statuscode).json(response);
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email first to login", {
      resendEmailLink: `${process.env.API_BASE_URL}/auth/resend-verification`,
    });
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 🔐 Hash refresh token
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedToken;
  user.lastLogin = new Date();

  await user.save({ validateBeforeSave: false });

  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 15,
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      "Login successful",
    ),
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Remove refresh token from DB
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

  // Clear cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "logged out successfully"));
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

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || user.isEmailVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Verification email resent. Please check your inbox.",
        ),
      );
  }

  const coolDownMs = Number(process.env.EMAIL_RESEND_COOLDOWN_MS) || 60000;
  const maxEmails = Number(process.env.EMAIL_RESEND_MAX_PER_DAY) || 5;
  const countWindowMs = 24 * 60 * 60 * 1000;

  if (
    user.lastVerificationEmailSentAt &&
    Date.now() - user.lastVerificationEmailSentAt < coolDownMs
  ) {
    throw new ApiError(429, "Please wait before resending");
  }

  if (
    !user.firstVerificationEmailSentAt ||
    Date.now() - user.firstVerificationEmailSentAt > countWindowMs
  ) {
    user.verificationEmailCount = 0;
    user.firstVerificationEmailSentAt = Date.now();
  }

  if (user.verificationEmailCount >= maxEmails) {
    throw new ApiError(429, "Max resend limit reached");
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  user.lastVerificationEmailSentAt = Date.now();
  user.verificationEmailCount += 1;
  await user.save();

  const emailVerificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${unHashedToken}`;
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
  const token = String(req.query.token || "").trim();

  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  user.password = newPassword;
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password has been reset successfully. Please login with new password.",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Missing refresh token in cookies");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (err) {
    // Clear cookies on invalid token
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Get user from decoded token
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // 🔐 HASH incoming refresh token
  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  // 🔐 Compare hashed token with stored hash
  if (hashedIncomingToken !== user.refreshToken) {
    // Possible token reuse attack → invalidate stored token
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      403,
      "Refresh token reuse detected. Please log in again.",
    );
  }

  // 🔁 Generate new tokens (rotation)
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // 🔐 HASH new refresh token before storing
  const hashedNewRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = hashedNewRefreshToken;
  await user.save({ validateBeforeSave: false });

  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  res.cookie("accessToken", accessToken, cookieOptions);

  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Access token refreshed successfully"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "Reset password email sent successfully"),
        );
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${unHashedToken}`;

  const userName = user.username;

  const mailContent = forgetPasswordMailGenContent(userName, resetPasswordUrl);

  await sendEmail({
    subject: "Reset Your Password",
    to: user.email,
    mailGenContent: mailContent,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reset password email sent successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(400, "please log in to change password");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password cannot be the same as old password");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "please enter the correct old password");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "user password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userProfile = await User.findById(req.user._id).select("-password");

  if (!userProfile) {
    throw new ApiError(401, "Didn't get the user profile");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;
  const userId = req.user._id;

  // Check username uniqueness if being changed
  if (username) {
    const existing = await User.findOne({
      username,
      _id: { $ne: userId }, // exclude current user
    });
    if (existing) {
      throw new ApiError(409, "Username already taken");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...(fullName && { fullName }),
        ...(username && { username }),
      },
    },
    { new: true }, // return updated document
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});


export const updateAvatar = asyncHandler(async (req, res) => {
  // CloudinaryStorage puts the result directly on req.file
  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  // req.file from CloudinaryStorage contains:
  // req.file.path      → Cloudinary URL
  // req.file.filename  → public_id
  const avatarUrl = req.file.path;
  const avatarPublicId = req.file.filename;

  // Get current user to delete old avatar from Cloudinary
  const currentUser = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary if it exists
  if (currentUser?.avatar?.public_id) {
    await cloudinary.uploader.destroy(currentUser.avatar.public_id);
  }

  // Update user with new avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: avatarUrl,
          public_id: avatarPublicId, // ← store for future deletion
          localPath: "",
        },
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
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
