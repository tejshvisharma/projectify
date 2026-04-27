import { Router } from "express";
import {
  createSubTask,
  getSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/subTask.controllers.js";
import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSubTaskValidator,
  updateSubTaskValidator,
  paginateSubTasksValidator,
} from "../validators/subtask.validators.js";
import { PROJECT_ROLES } from "../utils/constants.js";
import { doubleCsrfProtection } from "../utils/csrf.js";

const router = Router();

// Subtasks are scoped to tasks, which are scoped to projects
// We need projectId in the route to validate project membership
router
  .route("/:projectId/tasks/:taskId")
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.EDITORS),
    doubleCsrfProtection,
    createSubTaskValidator(),
    validate,
    createSubTask,
  )
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getSubTask,
  );

router
  .route("/:projectId/:SubTaskId")
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.EDITORS),
    doubleCsrfProtection,
    updateSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.EDITORS),
    doubleCsrfProtection,
    deleteSubTask,
  );

export default router;
