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

const router = Router();

// Subtasks are scoped to tasks, which are scoped to projects
// We need projectId in the route to validate project membership
router
  .route("/:projectId/tasks/:taskId")
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.EDITORS),
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
    updateSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.EDITORS),
    paginateSubTasksValidator(),
    validate,
    deleteSubTask,
  );

export default router;
