import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.models.js";

import { projectMember } from "../models/projectmember.models.js";
import { project as Project } from "../models/project.models.js";

import mongoose from "mongoose";

import { GLOBAL_ROLES } from "../utils/constants.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!accessToken) {
    throw new ApiError(401, "No Token Found, Unauthorized request");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "_id username email role",
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    return next(err);
  }
});

export const validateProjectPermission = (
  roles = [],
  globalBypass = [GLOBAL_ROLES.SUPERADMIN],
) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId is required");
    }

    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid projectId format");
    }

    // Verify project exists
    const projectDoc = await Project.findById(projectId);
    if (!projectDoc) {
      throw new ApiError(404, "Project not found");
    }

    // Global bypass (e.g., superadmin)
    if (globalBypass.includes(req.user.role)) {
      req.project = projectDoc;
      return next();
    }

    // Find project membership
    const projectMembership = await projectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!projectMembership) {
      throw new ApiError(403, "Not a member of this project");
    }

    const userRole = projectMembership.role;

    // Check if roles array is provided and contains the user's role
    if (roles.length > 0 && !roles.includes(userRole)) {
      throw new ApiError(
        403,
        `Access denied. Required roles: ${roles.join(", ")}. Your role: ${userRole}`,
      );
    }

    // Attach project and membership to request
    req.project = projectDoc;
    req.membership = projectMembership;

    next();
  });

export const requireGlobalRole =
  (roles = []) =>
  (req, _res, next) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Requires one of: ${roles.join(", ")}. You are: ${req.user.role}`,
      );
    }
    next();
  };
