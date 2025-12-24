import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { userRolesEnum } from "../utils/constants.js";
import { project as Project } from "../models/project.models.js";
import { task as Task } from "../models/task.models.js";
import cloudinary from "../config/cloudinary.js";
import {
  parsePaginationParams,
  createPaginationMeta,
} from "../utils/pagination.js";

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  const {
    title,
    description,
    assignedTo,
    status,
    priority,
    difficulty,
    credits,
    dueDate,
  } = req.body;

  // Ensure assignee is in this project
  const isProjectMember = await ProjectMember.findOne({
    project: projectId,
    user: assignedTo,
  });
  if (!isProjectMember)
    throw new ApiError(404, "Assignee is not part of the project");

  // Check dates safely
  if (dueDate && existingProject.endDate) {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) throw new ApiError(400, "Invalid dueDate");
    if (due > existingProject.endDate) {
      throw new ApiError(403, "Task due date cannot be after project end date");
    }
  }

  // map uploaded files (multer-storage-cloudinary result)
  const attachments =
    (req.files || []).map((f) => ({
      url: f.path, // secure Cloudinary URL
      public_id: f.filename, // Cloudinary public_id
      resource_type: f.resource_type,
      bytes: f.bytes,
      format: f.format,
      original_filename: f.originalname,
      mimeType: f.mimetype,
    })) ?? [];

  const newTask = await Task.create({
    project: projectId,
    title: title?.trim(),
    description: description?.trim(),
    createdBy: req.user._id,
    assignedTo,
    status,
    attachments,
    priority,
    difficulty,
    credits,
    dueDate,
  });

  // (Optional) Populate for a richer response
  const populated = await Task.findById(newTask._id)
    .populate("createdBy", "_id username avatar")
    .populate("assignedTo", "_id username avatar")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Task created successfully"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page, limit, skip } = parsePaginationParams(req.query);

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  const filter = { project: mongoose.Types.ObjectId(projectId) };

  const [total, allTasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate("createdBy", "_id username avatar")
      .populate("assignedTo", "_id username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const meta = createPaginationMeta(page, limit, total);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tasks: allTasks, meta },
        "Project tasks fetched successfully",
      ),
    );
});

export const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { removeFiles = [] } = req.body; // ✅ array of public_ids to delete
  const changes = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const task = await Task.findById(taskId);
  if (!task || String(task.project) !== String(projectId))
    throw new ApiError(404, "Task not found in this project");

  // ✅ Remove requested files from Cloudinary and DB
  if (removeFiles.length > 0) {
    const remainingAttachments = task.attachments.filter(
      (file) => !removeFiles.includes(file.public_id),
    );

    const deletePromises = task.attachments
      .filter((file) => removeFiles.includes(file.public_id))
      .map((file) =>
        cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.resource_type || "image",
        }),
      );

    await Promise.all(deletePromises);
    task.attachments = remainingAttachments;
  }

  // ✅ Add new uploaded files (if any)
  if (req.files && req.files.length > 0) {
    const newFiles = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
      size: file.size,
    }));
    task.attachments.push(...newFiles);
  }

  // ✅ Validate dueDate
  if (changes.dueDate) {
    const due = new Date(changes.dueDate);
    if (isNaN(due.getTime())) throw new ApiError(400, "Invalid dueDate");
    if (project.endDate && due > project.endDate)
      throw new ApiError(403, "dueDate after project end date");
  }

  // ✅ Update allowed fields
  const allowed = [
    "title",
    "description",
    "assignedTo",
    "status",
    "priority",
    "difficulty",
    "dueDate",
    "credits",
  ];
  for (let k of allowed) if (k in changes) task[k] = changes[k];

  await task.save();

  const populated = await Task.findById(task._id)
    .populate("createdBy assignedTo", "_id username avatar")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const task = await Task.findById(taskId);
  if (!task || String(task.project) !== String(projectId))
    throw new ApiError(404, "Task not found");

  // ✅ Remove attachments from Cloudinary
  if (task.attachments && task.attachments.length > 0) {
    const deletePromises = task.attachments.map((file) =>
      cloudinary.uploader.destroy(file.public_id, {
        resource_type: file.resource_type || "image",
      }),
    );
    await Promise.all(deletePromises);
  }

  // authorization if needed additional check: if caller is creator allow, else rely on middleware role
  await task.deleteOne(); // triggers pre('deleteOne') to remove comments

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});
