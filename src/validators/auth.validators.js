import { body } from "express-validator";
import User from "../models/user.models.js";
import { availableTaskStatus, availableUserRoles } from "../utils/constants.js";
import ApiError from "../utils/api-error.js";

const resendVerificationValidator = ()=>{
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail() // stop if empty
      .isEmail()
      .withMessage("Invalid Email, please enter valid Email")
      .custom(async (email) => {
        const existingUser = await User.findOne({
          email: { $regex: `^${email}$`, $options: "i" }, // case-insensitive match
        });
        
      }),
  ];
}
const userRegistrationValidator = () => {
  return [
    // EMAIL
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail() // stop if empty
      .isEmail()
      .withMessage("Invalid Email, please enter valid Email")
      .bail() // stop if invalid
      .custom(async (email) => {
        const existingUser = await User.findOne({
          email: { $regex: `^${email}$`, $options: "i" }, // case-insensitive match
        });
        if (existingUser) {
          throw new Error("Email is already registered");
        }
        return true;
      })
      ,

    // USERNAME
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
            .isEmail().withMessage("Invalid Email, please enter valid Email"),

        body('password')
            .notEmpty().withMessage("password is mandatory")
    ];
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgottenPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").optional(),
  ];
};
const addMemberToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(availableUserRoles)
      .withMessage("Role is invalid"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("assignedTo").notEmpty().withMessage("Assigned to is required"),
    body("status")
      .optional()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(availableTaskStatus),
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
};