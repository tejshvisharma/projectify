import mongoose from "mongoose";
import  Contribution  from "../models/contribution.model.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/api-error.js";

/**
 * Core approval logic. Called only from verifyTask controller.
 * Uses a session to guarantee atomicity across 3 writes.
 */
export async function approveTaskContribution({ task, verifierId, session }) {
  const isOnTime = task.dueDate ? new Date() <= new Date(task.dueDate) : true;
  const creditsEarned = isOnTime
    ? task.credits
    : Math.floor(task.credits * 0.7);

  // Guard: prevent duplicate contribution (task has unique index)
  const existing = await Contribution.findOne({ task: task._id }).session(
    session,
  );
  if (existing)
    throw new ApiError(409, "Contribution already recorded for this task");

  await Contribution.create(
    [
      {
        user: task.assignedTo,
        project: task.project,
        task: task._id,
        creditsEarned,
        maxCredits: task.credits,
        isOnTime,
        status: "approved",
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      },
    ],
    { session },
  );

  // Atomic stats update — never trust task.status for counting
  await Promise.all([
    ProjectMember.findOneAndUpdate(
      { project: task.project, user: task.assignedTo },
      {
        $inc: {
          "stats.totalCredits": creditsEarned,
          "stats.tasksCompleted": 1,
          ...(isOnTime ? { "stats.onTimeTasks": 1 } : {}),
        },
      },
      { session },
    ),
    User.findByIdAndUpdate(
      task.assignedTo,
      {
        $inc: {
          "stats.totalCredits": creditsEarned,
          "stats.totalTasksCompleted": 1,
          ...(isOnTime ? { "stats.onTimeTasks": 1 } : {}),
        },
      },
      { session },
    ),
  ]);

  return { creditsEarned, isOnTime };
}

/**
 * Reusable: check if userId is ADMIN or OWNER in a project.
 * Returns the ProjectMember doc (truthy) or throws 403.
 */
export async function requireManagementRole(projectId, userId) {
  const member = await ProjectMember.findOne({
    project: projectId,
    user: userId,
    role: { $in: ["owner", "project_admin"] },
  });
  if (!member)
    throw new ApiError(
      403,
      "Only project admins or owners can perform this action",
    );
  return member;
}
