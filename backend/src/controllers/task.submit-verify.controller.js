import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { task as Task } from "../models/task.models.js";
import {
  approveTaskContribution,
  requireManagementRole,
} from "../services/contribution.service.js";

// ─── SUBMIT ────────────────────────────────────────────────────────────────────
// PATCH /projects/:projectId/tasks/:taskId/submit
export const submitTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task || String(task.project) !== projectId)
    throw new ApiError(404, "Task not found in this project");

  // Only the assignee may submit
  if (String(task.assignedTo) !== String(userId))
    throw new ApiError(403, "Only the assigned user can submit this task");

  if (task.status !== "in_progress")
    throw new ApiError(
      400,
      `Task must be in_progress to submit (current: ${task.status})`,
    );

  // Build submission attachments from uploaded files (multer-cloudinary)
  const attachments = (req.files || []).map((f) => ({
    url: f.path,
    public_id: f.filename,
    resource_type: f.resource_type,
    bytes: f.bytes,
    format: f.format,
    original_filename: f.originalname,
    mimeType: f.mimetype,
  }));

  task.status = "submitted";
  task.submission = {
    comment: comment?.trim() ?? "",
    attachments,
    submittedAt: new Date(),
  };
  task.verification = { status: "pending" };

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task submitted for review"));
});

// ─── VERIFY (APPROVE / REJECT) ─────────────────────────────────────────────────
// PATCH /projects/:projectId/tasks/:taskId/verify
export const verifyTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { action, reason } = req.body; // action: "approve" | "reject"
  const verifierId = req.user._id;

  if (!["approve", "reject"].includes(action))
    throw new ApiError(400, 'action must be "approve" or "reject"');

  const task = await Task.findById(taskId);
  if (!task || String(task.project) !== projectId)
    throw new ApiError(404, "Task not found in this project");

  // Permission check via ProjectMember (not User.role)
  await requireManagementRole(projectId, verifierId);

  if (task.status !== "submitted")
    throw new ApiError(
      400,
      `Task must be in submitted state (current: ${task.status})`,
    );

  if (task.verification?.status !== "pending")
    throw new ApiError(
      400,
      `Task must be in pending state (current: ${task.verification?.status ?? "unknown"})`,
    );

  if (action === "approve") {
    // Use a transaction so contribution + stats are atomic
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const { creditsEarned, isOnTime } = await approveTaskContribution({
          task,
          verifierId,
          session,
        });

        task.status = "done";
        task.verification = {
          status: "approved",
          verifiedBy: verifierId,
          verifiedAt: new Date(),
        };
        await task.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { taskId, action: "approved" },
          "Task approved and contribution recorded",
        ),
      );
  }

  // ── REJECT ──────────────────────────────────────────────────────────────────
  if (!reason?.trim()) throw new ApiError(400, "Rejection reason is required");

  task.status = "in_progress"; // send back for revision
  task.verification = {
    status: "rejected",
    verifiedBy: verifierId,
    verifiedAt: new Date(),
  };
  task.rejection = {
    reason: reason.trim(),
    rejectedAt: new Date(),
  };

  await task.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { taskId, action: "rejected" },
        "Task rejected, sent back to assignee",
      ),
    );
});
