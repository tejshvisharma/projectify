import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import { projectMember as ProjectMember } from "../models/projectmember.models.js";
import User from "../models/user.models.js";
import Project from "../models/project.models.js";
import { parsePaginationParams } from "../utils/pagination.js";

const toSafeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getProjectStats = (doc) => ({
  totalCredits: toSafeNumber(doc?.stats?.totalCredits),
  tasksCompleted: toSafeNumber(doc?.stats?.tasksCompleted),
  onTimeTasks: toSafeNumber(doc?.stats?.onTimeTasks),
});

const getUserStats = (doc) => ({
  totalCredits: toSafeNumber(doc?.stats?.totalCredits),
  totalTasksCompleted: toSafeNumber(
    doc?.stats?.totalTasksCompleted ?? doc?.stats?.tasksCompleted,
  ),
  onTimeTasks: toSafeNumber(doc?.stats?.onTimeTasks),
});

const compareProjectRank = (a, b) => {
  if (b.stats.totalCredits !== a.stats.totalCredits) {
    return b.stats.totalCredits - a.stats.totalCredits;
  }
  if (b.stats.tasksCompleted !== a.stats.tasksCompleted) {
    return b.stats.tasksCompleted - a.stats.tasksCompleted;
  }
  if (b.stats.onTimeTasks !== a.stats.onTimeTasks) {
    return b.stats.onTimeTasks - a.stats.onTimeTasks;
  }

  const aUpdatedAt = new Date(a.updatedAt || 0).getTime();
  const bUpdatedAt = new Date(b.updatedAt || 0).getTime();
  if (aUpdatedAt !== bUpdatedAt) {
    return aUpdatedAt - bUpdatedAt;
  }

  return String(a._id).localeCompare(String(b._id));
};

const compareGlobalRank = (a, b) => {
  if (b.stats.totalCredits !== a.stats.totalCredits) {
    return b.stats.totalCredits - a.stats.totalCredits;
  }
  if (b.stats.totalTasksCompleted !== a.stats.totalTasksCompleted) {
    return b.stats.totalTasksCompleted - a.stats.totalTasksCompleted;
  }
  if (b.stats.onTimeTasks !== a.stats.onTimeTasks) {
    return b.stats.onTimeTasks - a.stats.onTimeTasks;
  }

  const aUpdatedAt = new Date(a.updatedAt || 0).getTime();
  const bUpdatedAt = new Date(b.updatedAt || 0).getTime();
  if (aUpdatedAt !== bUpdatedAt) {
    return aUpdatedAt - bUpdatedAt;
  }

  return String(a._id).localeCompare(String(b._id));
};

const isProjectStatsHigher = (candidate, current) =>
  compareProjectRank(candidate, current) < 0;

const isUserStatsHigher = (candidate, current) =>
  compareGlobalRank(candidate, current) < 0;

export const getProjectLeaderboard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page, limit, skip } = parsePaginationParams(req.query);

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const existingProject = await Project.findById(projectId)
    .select("_id")
    .lean();
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const [total, members] = await Promise.all([
    ProjectMember.countDocuments({ project: projectId }),
    ProjectMember.find({ project: projectId })
      .populate("user", "_id username avatar")
      .select("_id user role stats updatedAt")
      .lean(),
  ]);

  const sortedMembers = members
    .map((member) => ({
      _id: member._id,
      user: member.user,
      role: member.role,
      stats: getProjectStats(member),
      updatedAt: member.updatedAt,
    }))
    .sort(compareProjectRank);

  const paginatedLeaders = sortedMembers.slice(skip, skip + limit);

  const currentMember = sortedMembers.find(
    (member) => String(member?.user?._id) === String(req.user._id),
  );

  let currentUser = {
    rank: null,
    totalCredits: 0,
  };

  if (currentMember) {
    const betterCount = sortedMembers.filter((member) =>
      isProjectStatsHigher(member, currentMember),
    ).length;

    currentUser = {
      rank: betterCount + 1,
      totalCredits: currentMember.stats.totalCredits,
    };
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leaders: paginatedLeaders,
        pagination: {
          page,
          limit,
          total,
        },
        currentUser,
      },
      "Leaderboard fetched successfully",
    ),
  );
});

export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const users = await User.find({})
    .select("_id username avatar stats updatedAt")
    .lean();

  const total = users.length;

  const sortedUsers = users
    .map((user) => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      stats: getUserStats(user),
      updatedAt: user.updatedAt,
    }))
    .sort(compareGlobalRank);

  const paginatedLeaders = sortedUsers.slice(skip, skip + limit);

  const currentUserDoc = sortedUsers.find(
    (user) => String(user._id) === String(req.user._id),
  );

  let currentUser = {
    rank: null,
    totalCredits: 0,
  };

  if (currentUserDoc) {
    const betterCount = sortedUsers.filter((user) =>
      isUserStatsHigher(user, currentUserDoc),
    ).length;

    currentUser = {
      rank: betterCount + 1,
      totalCredits: currentUserDoc.stats.totalCredits,
    };
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leaders: paginatedLeaders,
        pagination: {
          page,
          limit,
          total,
        },
        currentUser,
      },
      "Leaderboard fetched successfully",
    ),
  );
});
