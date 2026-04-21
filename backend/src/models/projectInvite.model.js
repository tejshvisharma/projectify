import mongoose, { Schema } from "mongoose";
import { availableUserRoles } from "../utils/constants.js";

const projectInviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: availableUserRoles,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
);

projectInviteSchema.index({ email: 1, project: 1 });

export const projectInvite = mongoose.model(
  "projectInvite",
  projectInviteSchema,
);
