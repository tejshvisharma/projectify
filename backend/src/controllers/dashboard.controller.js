import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { task as Task } from "../models/task.models.js";
import Contribution from "../models/contribution.model.js";
import { projectMember } from "../models/projectmember.models.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { note as Note } from "../models/notes.models.js";
import { taskStatusEnums } from "../utils/constants.js";

const DASHBOARD_UPCOMING_WINDOW_DAYS = 5;
const DASHBOARD_RECENT_TASK_LIMIT = 10;
const DASHBOARD_COMPLETED_TASK_LIMIT = 10;
const DASHBOARD_ACTIVITY_LIMIT = 10;
const DASHBOARD_MENTION_LIMIT = 20;

const pluralize = (count, singular, plural = `${singular}s`) =>
  count === 1 ? singular : plural;

/**
 * @desc    Get user-centric dashboard aggregate
 * @route   GET /api/v1/dashboard/me
 * @access  Protected (authenticated user)
 */
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const upcomingWindowEnd = new Date(now);
  upcomingWindowEnd.setDate(now.getDate() + DASHBOARD_UPCOMING_WINDOW_DAYS);

  const projectMemberCollection = projectMember.collection.name;
  const projectCollection = Project.collection.name;
  const userCollection = User.collection.name;

  const getMembershipStages = () => [
    {
      $lookup: {
        from: projectMemberCollection,
        let: { projectId: "$project" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$project", "$$projectId"] },
                  { $eq: ["$user", userObjectId] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
          { $limit: 1 },
        ],
        as: "membership",
      },
    },
    { $match: { "membership.0": { $exists: true } } },
  ];

  const getProjectLookupStages = () => [
    {
      $lookup: {
        from: projectCollection,
        let: { projectId: "$project" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$projectId"] },
            },
          },
          { $project: { _id: 1, name: 1 } },
          { $limit: 1 },
        ],
        as: "projectDoc",
      },
    },
    {
      $unwind: {
        path: "$projectDoc",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const taskPayloadProjection = {
    $project: {
      _id: 1,
      title: 1,
      status: 1,
      dueDate: 1,
      createdAt: 1,
      updatedAt: 1,
      completionAt: 1,
      project: {
        _id: "$projectDoc._id",
        name: "$projectDoc.name",
      },
    },
  };

  const [taskDashboardFacet, mentions] = await Promise.all([
    Task.aggregate([
      { $match: { assignedTo: userObjectId } },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
          project: 1,
          "submission.submittedAt": 1,
          "verification.status": 1,
          "verification.verifiedAt": 1,
          "rejection.reason": 1,
          "rejection.rejectedAt": 1,
        },
      },
      {
        $facet: {
          assigned: [
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { createdAt: -1 } },
          ],
          inProgress: [
            { $match: { status: taskStatusEnums.IN_PROGRESS } },
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { dueDate: 1, createdAt: -1 } },
          ],
          submitted: [
            { $match: { status: taskStatusEnums.SUBMITTED } },
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { updatedAt: -1 } },
          ],
          upcoming: [
            {
              $match: {
                dueDate: {
                  $exists: true,
                  $ne: null,
                  $gte: now,
                  $lte: upcomingWindowEnd,
                },
                status: { $ne: taskStatusEnums.DONE },
              },
            },
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { dueDate: 1 } },
          ],
          overdue: [
            {
              $match: {
                dueDate: { $exists: true, $ne: null, $lt: now },
                status: { $ne: taskStatusEnums.DONE },
              },
            },
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { dueDate: 1 } },
          ],
          recent: [
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { createdAt: -1 } },
            { $limit: DASHBOARD_RECENT_TASK_LIMIT },
          ],
          completed: [
            { $match: { status: taskStatusEnums.DONE } },
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $addFields: {
                completionAt: {
                  $ifNull: ["$verification.verifiedAt", "$updatedAt"],
                },
              },
            },
            taskPayloadProjection,
            { $sort: { completionAt: -1 } },
            { $limit: DASHBOARD_COMPLETED_TASK_LIMIT },
          ],
          stats: [
            ...getMembershipStages(),
            {
              $group: {
                _id: null,
                totalAssigned: { $sum: 1 },
                totalCompleted: {
                  $sum: {
                    $cond: [{ $eq: ["$status", taskStatusEnums.DONE] }, 1, 0],
                  },
                },
                totalPending: {
                  $sum: {
                    $cond: [{ $ne: ["$status", taskStatusEnums.DONE] }, 1, 0],
                  },
                },
                totalOverdue: {
                  $sum: {
                    $cond: [
                      {
                        $let: {
                          vars: {
                            safeDueDate: {
                              $ifNull: ["$dueDate", null],
                            },
                          },
                          in: {
                            $and: [
                              { $ne: ["$$safeDueDate", null] },
                              { $lt: ["$$safeDueDate", now] },
                              { $ne: ["$status", taskStatusEnums.DONE] },
                            ],
                          },
                        },
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          activity: [
            ...getMembershipStages(),
            ...getProjectLookupStages(),
            {
              $project: {
                _id: 0,
                events: {
                  $concatArrays: [
                    [
                      {
                        type: "task_assigned",
                        taskId: "$_id",
                        taskTitle: "$title",
                        project: {
                          _id: "$projectDoc._id",
                          name: "$projectDoc.name",
                        },
                        timestamp: "$createdAt",
                      },
                    ],
                    {
                      $cond: [
                        {
                          $ne: [
                            { $ifNull: ["$submission.submittedAt", null] },
                            null,
                          ],
                        },
                        [
                          {
                            type: "task_submitted",
                            taskId: "$_id",
                            taskTitle: "$title",
                            project: {
                              _id: "$projectDoc._id",
                              name: "$projectDoc.name",
                            },
                            timestamp: "$submission.submittedAt",
                          },
                        ],
                        [],
                      ],
                    },
                    {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$verification.status", "approved"] },
                            {
                              $ne: [
                                {
                                  $ifNull: ["$verification.verifiedAt", null],
                                },
                                null,
                              ],
                            },
                          ],
                        },
                        [
                          {
                            type: "task_approved",
                            taskId: "$_id",
                            taskTitle: "$title",
                            project: {
                              _id: "$projectDoc._id",
                              name: "$projectDoc.name",
                            },
                            timestamp: "$verification.verifiedAt",
                          },
                        ],
                        [],
                      ],
                    },
                    {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$verification.status", "rejected"] },
                            {
                              $ne: [
                                {
                                  $ifNull: ["$verification.verifiedAt", null],
                                },
                                null,
                              ],
                            },
                          ],
                        },
                        [
                          {
                            type: "task_rejected",
                            taskId: "$_id",
                            taskTitle: "$title",
                            project: {
                              _id: "$projectDoc._id",
                              name: "$projectDoc.name",
                            },
                            reason: "$rejection.reason",
                            timestamp: {
                              $ifNull: [
                                "$rejection.rejectedAt",
                                "$verification.verifiedAt",
                              ],
                            },
                          },
                        ],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
            { $unwind: "$events" },
            { $replaceRoot: { newRoot: "$events" } },
            { $sort: { timestamp: -1 } },
            { $limit: DASHBOARD_ACTIVITY_LIMIT },
          ],
        },
      },
    ]),
    Note.aggregate([
      { $match: { "mentions.user": userObjectId } },
      {
        $lookup: {
          from: projectMemberCollection,
          let: { projectId: "$project" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$project", "$$projectId"] },
                    { $eq: ["$user", userObjectId] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
            { $limit: 1 },
          ],
          as: "membership",
        },
      },
      { $match: { "membership.0": { $exists: true } } },
      { $sort: { createdAt: -1 } },
      { $limit: DASHBOARD_MENTION_LIMIT },
      {
        $lookup: {
          from: projectCollection,
          let: { projectId: "$project" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$projectId"] },
              },
            },
            { $project: { _id: 1, name: 1 } },
            { $limit: 1 },
          ],
          as: "projectDoc",
        },
      },
      {
        $unwind: {
          path: "$projectDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: userCollection,
          let: { creatorId: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$creatorId"] },
              },
            },
            { $project: { _id: 1, username: 1, avatar: 1 } },
            { $limit: 1 },
          ],
          as: "creatorDoc",
        },
      },
      {
        $unwind: {
          path: "$creatorDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          project: {
            _id: "$projectDoc._id",
            name: "$projectDoc.name",
          },
          creator: {
            _id: "$creatorDoc._id",
            username: "$creatorDoc.username",
            avatar: "$creatorDoc.avatar",
          },
        },
      },
    ]),
  ]);

  const facet = taskDashboardFacet?.[0] ?? {};
  const statsDoc = facet?.stats?.[0] ?? {};

  const tasks = {
    assigned: facet?.assigned ?? [],
    inProgress: facet?.inProgress ?? [],
    submitted: facet?.submitted ?? [],
    upcoming: facet?.upcoming ?? [],
    overdue: facet?.overdue ?? [],
    recent: facet?.recent ?? [],
    completed: facet?.completed ?? [],
  };

  const stats = {
    totalAssigned: statsDoc?.totalAssigned ?? 0,
    totalCompleted: statsDoc?.totalCompleted ?? 0,
    totalPending: statsDoc?.totalPending ?? 0,
    totalOverdue: statsDoc?.totalOverdue ?? 0,
  };

  const activity = facet?.activity ?? [];

  const suggestions = [];

  if (stats.totalOverdue > 0) {
    suggestions.push(
      `You have ${stats.totalOverdue} overdue ${pluralize(stats.totalOverdue, "task")}.`,
    );
  }

  if (tasks.upcoming.length > 0) {
    suggestions.push(
      `${tasks.upcoming.length} ${pluralize(tasks.upcoming.length, "task")} ${tasks.upcoming.length === 1 ? "is" : "are"} due in the next ${DASHBOARD_UPCOMING_WINDOW_DAYS} days.`,
    );
  }

  if (tasks.submitted.length > 0) {
    suggestions.push(
      `${tasks.submitted.length} ${pluralize(tasks.submitted.length, "task")} waiting for review.`,
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("No urgent items right now. Keep your momentum going.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tasks,
        mentions: mentions ?? [],
        stats,
        activity,
        suggestions,
      },
      "User dashboard fetched successfully",
    ),
  );
});

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
