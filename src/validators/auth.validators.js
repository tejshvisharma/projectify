import { body, param } from "express-validator";
import User from "../models/user.models.js";
import {
  availableTaskStatus,
  availableUserRoles,
  availableTaskDifficulties,
  availableTaskPriorities,
} from "../utils/constants.js";


const resendVerificationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid Email, please enter valid Email")
      .toLowerCase()
  ];
}
const userRegistrationValidator = () => {
  return [
    // EMAIL
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid Email, please enter valid Email")
      .bail() 
      .toLowerCase()
      .custom(async (email) => {
        const existingUser = await User.findOne({
          email: { $regex: `^${email}$`, $options: "i" }, 
        });
        if (existingUser) {
          throw new Error("Email is already registered");
        }
        return true;
      })
    ,

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .isLength({ max: 13 })
      .withMessage("Username must be less than 13 characters")
      .bail()
      .custom(async (username) => {
        const user = await User.findOne({
          username: { $regex: `^${username}$`, $options: "i" },
        });
        if (user) {
          throw new Error("Username is already taken");
        }
        return true;
      }),

    // PASSWORD
    body("password")
      .notEmpty()
      .withMessage("Password is mandatory")
      .bail()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters and include 1 lowercase, 1 uppercase, 1 number, and 1 symbol",
      ),

    // CONFIRM PASSWORD
    body("confirmPassword")
      .notEmpty()
      .withMessage("Please confirm your password")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords didn't match");
        }
        return true;
      }),
  ];
};

const userLoginValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage("Email is required").bail()
      .isEmail().withMessage("Invalid Email, please enter valid Email")
      .toLowerCase(),

    body('password')
      .notEmpty().withMessage("password is mandatory")
  ];
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
    body("confirmNewPassword").notEmpty().withMessage("Confirm your new password"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Email is invalid")
      .toLowerCase(),
  ];
};

const userResetForgottenPasswordValidator = () => {
  return [
    body("newPassword")
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters and include 1 lowercase, 1 uppercase, 1 number, and 1 symbol",
      ),
  ];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Project Name is required"),
    body("description").optional(),
  ];
};
const addMemberToProjectValidator = () => {
  return [
    param("projectId").isMongoId().withMessage("Invalid projectId"),
    body("userId").isMongoId().withMessage("Invalid userId"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .bail()
      .isIn(availableUserRoles)
      .withMessage("Role is invalid"),
  ];
};

const updateProjectMemberRoleValidator = () => {
  (param("projectId")
    .isMongoId().withMessage("Invalid projectId"),
    param("memberId")
    .isMongoId().withMessage("Invalid MemberId"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .bail()
      .isIn(availableUserRoles)
      .withMessage("Role is invalid"));


}

const deleteMemberToProjectValidator = () => {

};

const createTaskValidator = () => {
  return [
    param("projectId")
    .notEmpty()
    .withMessage("projectId is mandatory")
    .isMongoId()
    .withMessage("ProjectId is invalid"),
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("assignedTo")
      .notEmpty()
      .withMessage("Assigned to is required")
      .isMongoId()
      .withMessage("Invalid assignee"),
    body("status").optional().bail().isIn(availableTaskStatus),
    body("priority")
      .optional()
      .isIn(availableTaskPriorities)
      .withMessage("Priority is invalid"),
    body("difficulty")
      .optional()
      .isIn(availableTaskDifficulties)
      .withMessage("Difficulty is invalid"),
    body("dueDate").optional().isDate(),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title").optional(),
    body("description").optional(),
    body("status")
      .optional()
      .isIn(availableTaskStatus)
      .withMessage("Status is invalid"),
    body("assignedTo").optional(),
    body("priority")
      .optional()
      .isIn(availableTaskPriorities)
      .withMessage("Priority is invalid"),
    body("difficulty")
      .optional()
      .isIn(availableTaskDifficulties)
      .withMessage("Difficulty is invalid"),
    body("dueDate").optional().isDate(),
  ];
};

const notesValidator = () => {
  return [body("content").notEmpty().withMessage("Content is required")];
};

export {
  userLoginValidator,
  userRegistrationValidator,
  addMemberToProjectValidator,
  createProjectValidator,
  createTaskValidator,
  notesValidator,
  updateTaskValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  resendVerificationValidator,
  deleteMemberToProjectValidator,
  updateProjectMemberRoleValidator,
};