// validators/task.validators.js
import { body, param } from "express-validator";
import {
  availableTaskStatus,
  availableTaskPriorities,
  availableTaskDifficulties,
} from "../utils/constants.js";

export const createTaskValidator = () => [
  param("projectId")
    .notEmpty()
    .withMessage("projectId is mandatory")
    .isMongoId()
    .withMessage("ProjectId is invalid"),
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").optional().isString().trim(),
  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned to is required")
    .isMongoId()
    .withMessage("Invalid assignee"),
  body("status")
    .optional()
    .isIn(availableTaskStatus)
    .withMessage("Status is invalid"),
  body("priority")
    .optional()
    .isIn(availableTaskPriorities)
    .withMessage("Priority is invalid"),
  body("difficulty")
    .optional()
    .isIn(availableTaskDifficulties)
    .withMessage("Difficulty is invalid"),
  body("dueDate").optional().isISO8601().toDate(),
];

export const updateTaskValidator = () => [
  param("projectId").isMongoId().withMessage("ProjectId is invalid"),
  param("taskId").isMongoId().withMessage("TaskId is invalid"),
  body("title").optional().isString().trim(),
  body("description").optional().isString().trim(),
  body("status")
    .optional()
    .isIn(availableTaskStatus)
    .withMessage("Status is invalid"),
  body("assignedTo").optional().isMongoId().withMessage("Invalid assignee"),
  body("priority")
    .optional()
    .isIn(availableTaskPriorities)
    .withMessage("Priority is invalid"),
  body("difficulty")
    .optional()
    .isIn(availableTaskDifficulties)
    .withMessage("Difficulty is invalid"),
  body("dueDate").optional().isISO8601().toDate(),
];

export const verifyTaskValidator = () => {
  return [
    param("projectId")
      .notEmpty()
      .withMessage("projectId is required")
      .isMongoId()
      .withMessage("Invalid projectId"),

    param("taskId")
      .notEmpty()
      .withMessage("taskId is required")
      .isMongoId()
      .withMessage("Invalid taskId"),

    body("action")
      .notEmpty()
      .withMessage("Action is required")
      .isIn(["approve", "reject"])
      .withMessage('Action must be either approve or reject'),

    body("reason")
      .if(body("action").equals("reject"))
      .notEmpty()
      .withMessage("Reason is required when rejecting")
      .isString()
      .withMessage("Reason must be a string")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Reason must be at least 3 characters long"),

    body("reason").optional().trim(),
  ];
};
