import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { task as Task } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { project as Project } from "../models/project.models.js";

export const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, isCompleted = false } = req.body;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const projectId = task.project;

  const project = await Project.findById(projectId).populate(
    "createdBy",
    "id avatar username",
  );
  if (!project) throw new ApiError(404, "Project not found");


  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  });
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  if (
    String(task.assignedTo) !== String(req.user._id) &&
    String(task.createdBy) !== String(req.user._id) &&
    String(project.createdBy) !== String(req.user._id) &&
    String(isMember.role) !== "project_admin"
  ) {
    throw new ApiError(403, "You are not allowed to create a Sub Task");
  }

  const newSubTask = await subTask.create({
    title,
    task: taskId,
    isCompleted: isCompleted,
    createdBy: req.user._id,
  });

  await newSubTask.populate("createdBy", "_id avatar username");

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      newSubTask,
      "New Sub Task created successfully"
    ));
});

export const getSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) throw new ApiError(404, "Task not found");

  const projectId = task.project;

  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  }).lean();
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  // Parse with safe defaults
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Count for meta
  const filter = { task: taskId };
  const [total, subTasks] = await Promise.all([
    subTask.countDocuments(filter),
    subTask.find(filter)
      .populate("createdBy", "_id avatar username")
      .sort({ createdAt: -1 }) // stable, newest first
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items: subTasks,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      "Subtasks fetched successfully",
    ),
  );
});

export const updateSubTask = asyncHandler(async (req, res) => {
  const { SubTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const existingSubTask = await subTask.findById(SubTaskId);

  if (!existingSubTask) throw new ApiError(404, "Sub Task not found");

  const task = await Task.findById(existingSubTask.task);

  const projectId = task.project;

   const project = await Project.findById(projectId).populate(
     "createdBy",
     "id avatar username",
   );
   if (!project) throw new ApiError(404, "Project not found");

  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  });
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  if (
    String(task.assignedTo) !== String(req.user._id) &&
    String(task.createdBy) !== String(req.user._id) &&
    String(task.project.createdBy) !== String(req.user._id) &&
    String(isMember.role) !== "project_admin"
  ) {
    throw new ApiError(403, "You are not allowed to update this Sub Task");
  }

  existingSubTask.title = title ?? existingSubTask.title;
  if (typeof isCompleted === "boolean")
    existingSubTask.isCompleted = isCompleted;

  await existingSubTask.save();

  await existingSubTask.populate("createdBy", "_id avatar username");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingSubTask,
        "Sub Task updated successfully",
      ),
    );

});

export const deleteSubTask = asyncHandler(async (req, res) => {
  const { SubTaskId } = req.params;
  const existingSubTask = await subTask.findById(SubTaskId);

  if (!existingSubTask) throw new ApiError(404, "Sub Task not found");

  const task = await Task.findById(existingSubTask.task);

  const projectId = task.project;

   const project = await Project.findById(projectId).populate(
     "createdBy",
     "id avatar username",
   );
   if (!project) throw new ApiError(404, "Project not found");

  const isMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  });
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  if (
    String(task.assignedTo) !== String(req.user._id) &&
    String(task.createdBy) !== String(req.user._id) &&
    String(project.createdBy) !== String(req.user._id) &&
    String(isMember.role) !== "project_admin"
  ) {
    throw new ApiError(403, "You are not allowed to delete this Sub Task");
  }

  await existingSubTask.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Sub Task deleted successfully"),
    );
});

