import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { userRolesEnum } from "../utils/constants.js";
import Project from "../models/project.models.js";
import {
  parsePaginationParams,
  createPaginationMeta,
} from "../utils/pagination.js";

export const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role = userRolesEnum.VIEWER } = req.body;

  const targetUser = await User.findById(userId).select("_id username email");
  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  const targetProject = await Project.findById(projectId);
  if (!targetProject) {
    throw new ApiError(404, "Target project not found");
  }

  const exists = await ProjectMember.findOne({
    project: projectId,
    user: targetUser._id,
  });

  if (exists) {
    throw new ApiError(409, "User is already a member of this project");
  }

  try {
    const member = await ProjectMember.create({
      project: new mongoose.Types.ObjectId(projectId),
      user: targetUser._id,
      role,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          id: member._id,
          project: member.project,
          role: member.role,
          user: {
            id: targetUser._id,
            username: targetUser.username,
            email: targetUser.email,
          },
        },
        "Member added to project",
      ),
    );
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, "User is already a member of this project");
    }
    throw err;
  }
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const targetProject = await Project.findById(projectId);
  if (!targetProject) {
    throw new ApiError(404, "Target project not found");
  }

  try {
    const projectMembers = await ProjectMember.find({
      project: new mongoose.Types.ObjectId(projectId),
    })
      .populate("user", "_id username avatar ")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          projectMembers,
          "Project members fetched successfully",
        ),
      );
  } catch (err) {
    throw err;
  }
});

export const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const { role } = req.body;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const existingMember = await ProjectMember.findById(memberId).populate(
    "user",
    "avatar username email",
  );

  if (!existingMember) {
    throw new ApiError(404, "Project Member not found");
  }

  // Ensure member belongs to this project
  if (String(existingMember.project) !== String(projectId)) {
    throw new ApiError(400, "Member does not belong to this project");
  }

  // Prevent users from changing their own role
  if (String(existingMember.user._id) === String(req.user._id)) {
    throw new ApiError(403, "You cannot change your own role");
  }

  // Check if this is the last owner
  if (
    existingMember.role === userRolesEnum.OWNER &&
    role !== userRolesEnum.OWNER
  ) {
    const ownerCount = await ProjectMember.countDocuments({
      project: projectId,
      role: userRolesEnum.OWNER,
    });

    if (ownerCount === 1) {
      throw new ApiError(
        403,
        "Cannot change role of the last owner. Assign another owner first.",
      );
    }
  }

  existingMember.role = role;
  await existingMember.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: existingMember.user,
        project: existingMember.project,
        role: existingMember.role,
      },
      "Member role updated successfully",
    ),
  );
});

export const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  // Check if the member to be deleted is an owner
  const memberToDelete = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    _id: new mongoose.Types.ObjectId(memberId),
  });

  if (!memberToDelete) {
    throw new ApiError(404, "Member not found");
  }

  // Prevent removing the last owner
  if (memberToDelete.role === userRolesEnum.OWNER) {
    const ownerCount = await ProjectMember.countDocuments({
      project: projectId,
      role: userRolesEnum.OWNER,
    });

    if (ownerCount === 1) {
      throw new ApiError(
        403,
        "Cannot remove the last owner. Assign another owner first.",
      );
    }
  }

  await memberToDelete.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, memberToDelete, "Member removed from project"));
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, endDate, githubRepo = "", tags = [] } = req.body;

  const newProject = await Project.create({
    name,
    description,
    endDate,
    githubRepo,
    tags,
    createdBy: req.user._id,
  });

  await ProjectMember.create({
    project: newProject._id,
    user: req.user._id,
    role: userRolesEnum.OWNER,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProject, "Project created successfully"));
});

export const getProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const filter = { user: new mongoose.Types.ObjectId(req.user._id) };

  console.log(mongoose.modelNames());


  const [total, memberships] = await Promise.all([
    ProjectMember.countDocuments(filter),
    ProjectMember.find(filter)
      .populate("project")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const projects = memberships.map((m) => m.project);

  const meta = createPaginationMeta(page, limit, total);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { projects, meta }, "Projects fetched successfully"),
    );
});

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const { name, description, endDate, githubRepo, tags } = req.body;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  if (name) existingProject.name = name;
  if (description) existingProject.description = description;
  if (endDate) existingProject.endDate = endDate;
  if (githubRepo) existingProject.githubRepo = githubRepo;
  if (tags) existingProject.tags = tags;

  await existingProject.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, existingProject, "Project updated successfully"),
    );
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Project existence and membership already validated by middleware
  const existingProject = req.project;

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  // RBAC check handled by middleware - only OWNER can reach here

  await existingProject.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});
