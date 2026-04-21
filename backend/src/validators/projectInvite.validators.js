import { body, param } from "express-validator";
import { availableUserRoles } from "../utils/constants.js";

export const inviteOrAddProjectMemberValidator = () => [
  param("projectId").isMongoId().withMessage("Invalid projectId"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .bail()
    .isIn(availableUserRoles)
    .withMessage("Role is invalid"),
];

export const acceptProjectInviteValidator = () => [
  param("token").trim().notEmpty().withMessage("Invite token is required"),
];

export const deleteProjectInviteValidator = () => [
  param("projectId").isMongoId().withMessage("Invalid projectId"),
  param("inviteId").isMongoId().withMessage("Invalid inviteId"),
];
