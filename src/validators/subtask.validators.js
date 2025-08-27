import { body, param, query } from "express-validator";

export const createSubTaskValidator = () => [
  param("taskId").notEmpty().isMongoId().withMessage("Valid taskId required"),
  body("title").notEmpty().isString().withMessage("Title is required"),
  body("isCompleted").optional().isBoolean(),
];

export const updateSubTaskValidator = () => [
  param("subTaskId")
    .notEmpty()
    .isMongoId()
    .withMessage("Valid subTaskId required"),
  body("title").optional().isString(),
  body("isCompleted").optional().isBoolean(),
];

// ✅ New: for GET /:taskId
export const paginateSubTasksValidator = () => [
  param("taskId").notEmpty().isMongoId().withMessage("Valid taskId required"),
  query("page").optional().toInt().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be 1..100"),
];