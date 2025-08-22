import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import { userRolesEnum } from "../utils/constants.js";
import { project as Project } from "../models/project.models.js";
import {  task as Task } from "../models/task.models.js";

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  const {
    title,
    description,
    assignedTo,
    status,
    attachments,
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

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  const allTasks = await Task.find({
    project:  mongoose.Types.ObjectId(projectId),
  })
    .populate("createdBy", "_id username avatar")
    .populate("assignedTo", "_id username avatar")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, allTasks, "Project tasks fetched successfully"));
});


export const updateTask = asyncHandler(async (req, res) => {
  
    const { projectId, taskId } = req.params;
    const changes = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const task = await Task.findById(taskId);

    if (!task || String(task.project) !== String(projectId))
      throw new ApiError(404, "Task not found in this project");

    // if assignedTo changed -> ensure user exists and is project member
    if (changes.assignedTo && changes.assignedTo !== String(task.assignedTo)) {
      const newAss = await User.findById(changes.assignedTo);
      if (!newAss) throw new ApiError(404, "Assignee not found");

      const isMember = await ProjectMember.findOne({
        project: projectId,
        user: changes.assignedTo,
      });
      if (!isMember)
        throw new ApiError(400, "Assignee must be a project member");
    }

    // validate dueDate
    if (changes.dueDate) {
      const due = new Date(changes.dueDate);
      if (isNaN(due.getTime())) throw new ApiError(400, "Invalid dueDate");
      if (project.endDate && due > project.endDate)
        throw new ApiError(403, "dueDate after project end date");
    }

    // allowed updates
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

    if (!allowed.some((k) => k in changes)) {
      throw new ApiError(400, "No valid fields provided for update");
    }

    Object.keys(changes).forEach((key) => {
      if (!allowed.includes(key)) delete changes[key];
    });

    for (let k of allowed) if (k in changes) task[k] = changes[k];

    await task.save();

    const populated = await Task.findById(task._id).populate(
      "createdBy assignedTo",
      "_id username avatar",
    );
    return res
      .status(200)
      .json(new ApiResponse(200, populated, "Task updated"));
  });



export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const task = await Task.findById(taskId);
  if (!task || String(task.project) !== String(projectId))
    throw new ApiError(404, "Task not found");

  // authorization if needed additional check: if caller is creator allow, else rely on middleware role
  await task.deleteOne(); // triggers pre('deleteOne') to remove comments

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

