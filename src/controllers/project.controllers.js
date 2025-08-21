import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { userRolesEnum } from "../utils/constants.js";
import { project as Project } from "../models/project.models.js";

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
            project: mongoose.Types.ObjectId(projectId),
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
            project: mongoose.Types.ObjectId(projectId),
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
            "Member updated to project",
        ),
    );
});

export const deleteProjectMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;

    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
        throw new ApiError(404, "Project not found");
    }

    try {
        const deletedMember = await ProjectMember.findOneAndDelete({
            project: mongoose.Types.ObjectId(projectId),
            _id: mongoose.Types.ObjectId(memberId),
        });

        if (!deletedMember) {
            throw new ApiError(404, "Member not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, deletedMember, "Member deleted from project"));
    } catch (err) {
        throw err;
    }
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
  const memberships = await ProjectMember.find({
    user: mongoose.Types.ObjectId(req.user._id),
  }).populate("project");

  const projects = memberships.map((m) => m.project);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
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

  const existingProject = await Project.findById(projectId);

  if (!existingProject) throw new ApiError(404, "Project not found");

  if (String(existingProject.createdBy) !== String(req.user._id)) {
    throw new ApiError(403, "Only project creator can delete project");
  }

  await ProjectMember.deleteMany({ project: projectId });

  await existingProject.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});
