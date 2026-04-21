import { asyncHandler } from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import {
  parsePaginationParams,
  createPaginationMeta,
} from "../utils/pagination.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const { page, limit, skip } = parsePaginationParams(req.query);

  const query = String(q || "").trim();
  const safeQuery = escapeRegex(query);

  const filter = {
    $or: [
      { username: { $regex: safeQuery, $options: "i" } },
      { email: { $regex: safeQuery, $options: "i" } },
    ],
  };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("_id username email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const meta = createPaginationMeta(page, limit, total);

  return res
    .status(200)
    .json(new ApiResponse(200, { users, meta }, "Users fetched successfully"));
});
