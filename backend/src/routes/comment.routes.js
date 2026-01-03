import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";
import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCommentValidator,
  updateCommentValidator,
} from "../validators/comment.validators.js";
import { PROJECT_ROLES } from "../utils/constants.js";

const router = Router();

// Comments are scoped to tasks, which are scoped to projects
// We need projectId in the route to validate project membership
router
  .route("/:projectId/tasks/:taskId")
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    createCommentValidator(),
    validate,
    createComment,
  )
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getComments,
  );

router
  .route("/:projectId/edit/:commentId")
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    updateCommentValidator(),
    validate,
    updateComment,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    deleteComment,
  );

export default router;
