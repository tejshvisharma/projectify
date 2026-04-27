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
import {doubleCsrfProtection} from "../utils/csrf.js";
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
    doubleCsrfProtection,
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
    doubleCsrfProtection,
    updateComment,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    doubleCsrfProtection,
    deleteComment,
  );

export default router;
