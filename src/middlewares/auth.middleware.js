import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.models.js";

import { projectMember } from "../models/projectmember.models.js"; 

import mongoose from "mongoose";

import { GLOBAL_ROLES } from "../utils/constants.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);

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

export const validateProjectPermission =(roles = [],
    globalBypass = [GLOBAL_ROLES.SUPERADMIN]) => 
    asyncHandler( async (req, res, next) => {

      const { projectId } = req.params;

      if(!projectId){
        throw new ApiError(400, "projectId is required");
      }

      // 1) Global bypass (e.g., superadmin)
    if (globalBypass.includes(req.user.role)) return next();

      const projectMembership = await projectMember.findOne({
        project : mongoose.Types.ObjectId(projectId),
        user : mongoose.Types.ObjectId(req.user._id)
      }); 

      if(!projectMembership){
        throw new ApiError(403, "Not a member of this project");
      }

      const givenRole = projectMembership?.role; 

      
      if(!req.user || !roles.includes(givenRole)){
        throw new ApiError(403, "Access denied");
      }

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
;
    next();
  };
