import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { Comment } from "../models/comment.models.js";
import { task as Task } from "../models/task.models.js";
import { project as Project } from "../models/project.models.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";

export const createComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content, attachments = [] } = req.body;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Content is required");
  }

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  // Verify task belongs to the project in params
  if (String(task.project) !== String(req.params.projectId)) {
    throw new ApiError(400, "Task does not belong to this project");
  }

  // RBAC already validated by middleware

  const comment = await Comment.create({
    content,
    task: taskId,
    user: req.user._id,
    attachments,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "_id username avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Verify task belongs to the project in params
  if (String(task.project) !== String(req.params.projectId)) {
    throw new ApiError(400, "Task does not belong to this project");
  }

  // RBAC already validated by middleware

  const comments = await Comment.find({ task: taskId })
    .populate("user", "_id username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content, attachments } = req.body;

  const comment = await Comment.findById(commentId).populate("task");
  if (!comment) throw new ApiError(404, "Comment not found");

  // Verify comment belongs to a task in this project
  if (String(comment.task.project) !== String(req.params.projectId)) {
    throw new ApiError(400, "Comment does not belong to this project");
  }

  // Only author can update
  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError(403, "You can only update your own comment");
  }

  // RBAC already validated by middleware

  if (content) comment.content = content;
  if (attachments) comment.attachments = attachments;

  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId).populate("task");
  if (!comment) throw new ApiError(404, "Comment not found");

  // Verify comment belongs to a task in this project
  if (String(comment.task.project) !== String(req.params.projectId)) {
    throw new ApiError(400, "Comment does not belong to this project");
  }

  // RBAC already validated by middleware
  // Only author or project owner can delete
  if (
    String(comment.user) !== String(req.user._id) &&
    req.membership.role !== "owner"
  ) {
    throw new ApiError(
      403,
      "You can only delete your own comment unless you are project owner",
    );
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});
