import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { task as Task } from "../models/task.models.js";
import Contribution from "../models/contribution.model.js";
import { projectMember } from "../models/projectmember.models.js";
import { taskStatusEnums } from "../utils/constants.js";

/**
 * @desc    Get dashboard summary metrics for a project
 * @route   GET /api/v1/projects/:projectId/dashboard/summary
 * @access  Protected project members (viewer and above)
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid projectId format");
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Use facet to compute totals, status distribution, and overdue count in a single aggregation.
  const [taskStats, creditStats, recentContributions] = await Promise.all([
    Task.aggregate([
      { $match: { project: projectObjectId } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          statusGroups: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          overdueCount: [
            {
              $match: {
                dueDate: { $exists: true, $ne: null, $lt: new Date() },
                status: { $ne: taskStatusEnums.DONE },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),
    projectMember.aggregate([
      { $match: { project: projectObjectId } },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$stats.totalCredits" },
        },
      },
    ]),
    Contribution.find({ project: projectObjectId })
      .sort({ verifiedAt: -1 })
      .limit(10)
      .populate("user", "username avatar")
      .populate("task", "title")
      .lean(),
  ]);

  const facet = taskStats?.[0] ?? {};
  const totalTasks = facet?.totalCount?.[0]?.count ?? 0;
  const overdueTasks = facet?.overdueCount?.[0]?.count ?? 0;

  const statusCountMap = (facet?.statusGroups ?? []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const completedTasks = statusCountMap[taskStatusEnums.DONE] ?? 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusDistribution = [
    taskStatusEnums.TODO,
    taskStatusEnums.IN_PROGRESS,
    taskStatusEnums.SUBMITTED,
    taskStatusEnums.DONE,
  ].map((status) => ({
    status,
    count: statusCountMap[status] ?? 0,
  }));

  const totalCreditsEarned = creditStats?.[0]?.totalCredits ?? 0;

  const recentActivity = recentContributions.map((item) => ({
    type: `contribution_${item.status}`,
    taskTitle: item.task?.title ?? "",
    user: {
      username: item.user?.username ?? "",
      avatar: item.user?.avatar ?? "",
    },
    timestamp: item.verifiedAt,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpi: {
          totalTasks,
          completedTasks,
          completionRate,
          overdueTasks,
          totalCreditsEarned,
        },
        statusDistribution,
        recentActivity,
      },
      "Dashboard summary fetched successfully",
    ),
  );
});
