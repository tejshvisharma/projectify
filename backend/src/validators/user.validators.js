import { query } from "express-validator";

export const searchUsersValidator = () => [
  query("q").trim().notEmpty().withMessage("Search query is required"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];
