import crypto from "crypto";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { projectInvite as ProjectInvite } from "../models/projectInvite.model.js";

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const queueProjectInviteEmail = async (_payload) => {
  // Placeholder for future email integration.
  return null;
};

export const inviteOrAddProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID format");
  }

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail }).select(
    "_id username email avatar",
  );

  if (existingUser) {
    const existingMember = await ProjectMember.findOne({
      project: projectId,
      user: existingUser._id,
    });

    if (existingMember) {
      throw new ApiError(409, "User is already a member of this project");
    }

    const member = await ProjectMember.create({
      project: existingProject._id,
      user: existingUser._id,
      role,
    });

    const populatedMember = await ProjectMember.findById(member._id)
      .populate("user", "_id username email avatar")
      .lean();

    return res
      .status(201)
      .json(new ApiResponse(201, populatedMember, "Member added to project"));
  }

  await ProjectInvite.updateMany(
    {
      project: existingProject._id,
      email: normalizedEmail,
      status: "pending",
      expiresAt: { $lte: new Date() },
    },
    { $set: { status: "expired" } },
  );

  const existingPendingInvite = await ProjectInvite.findOne({
    project: existingProject._id,
    email: normalizedEmail,
    status: "pending",
  });

  if (existingPendingInvite) {
    throw new ApiError(409, "A pending invite already exists for this email");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

  const invite = await ProjectInvite.create({
    email: normalizedEmail,
    project: existingProject._id,
    role,
    invitedBy: req.user._id,
    token,
    expiresAt,
    status: "pending",
  });

  await queueProjectInviteEmail({
    email: normalizedEmail,
    projectId: existingProject._id,
    token,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: invite._id,
        email: invite.email,
        project: invite.project,
        role: invite.role,
        invitedBy: invite.invitedBy,
        expiresAt: invite.expiresAt,
        status: invite.status,
      },
      "Invite created successfully",
    ),
  );
});

export const acceptProjectInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const invite = await ProjectInvite.findOne({ token });

  if (!invite) {
    throw new ApiError(404, "Invite not found");
  }

  if (invite.status !== "pending") {
    throw new ApiError(409, "Invite is no longer pending");
  }

  if (invite.expiresAt <= new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new ApiError(410, "Invite has expired");
  }

  if (
    String(req.user.email).toLowerCase() !== String(invite.email).toLowerCase()
  ) {
    throw new ApiError(403, "This invite is not assigned to your account");
  }

  const project = await Project.findById(invite.project);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const existingMember = await ProjectMember.findOne({
    project: invite.project,
    user: req.user._id,
  });

  if (existingMember) {
    invite.status = "accepted";
    await invite.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, existingMember, "Invite accepted successfully"),
      );
  }

  let createdMember;
  try {
    createdMember = await ProjectMember.create({
      project: invite.project,
      user: req.user._id,
      role: invite.role,
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, "User is already a member of this project");
    }
    throw err;
  }

  invite.status = "accepted";
  await invite.save();

  const populatedMember = await ProjectMember.findById(createdMember._id)
    .populate("user", "_id username email avatar")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedMember, "Invite accepted successfully"),
    );
});

export const deleteProjectInvite = asyncHandler(async (req, res) => {
  const { projectId, inviteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID format");
  }

  if (!mongoose.Types.ObjectId.isValid(inviteId)) {
    throw new ApiError(400, "Invalid invite ID format");
  }

  const invite = await ProjectInvite.findOne({
    _id: inviteId,
    project: projectId,
    status: "pending",
  });

  if (!invite) {
    throw new ApiError(404, "Pending invite not found");
  }

  await invite.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, invite, "Invite removed successfully"));
});
