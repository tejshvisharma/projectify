import { body, param } from "express-validator";

export const createCommentValidator = () => [
  param("taskId").isMongoId().withMessage("Invalid taskId"),
  body("content").notEmpty().withMessage("Content is required"),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

export const updateCommentValidator = () => [
  param("commentId").isMongoId().withMessage("Invalid commentId"),
  body("content").optional().isString(),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];
