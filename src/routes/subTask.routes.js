import { Router } from "express";
import {
    createSubTask,
    getSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controllers/comment.controllers.js";
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

router
    .route("/:taskId")
    .post(
        isLoggedIn,
        createSubTaskValidator(),
        validate,
        createSubTask,
    )
    .get(isLoggedIn, getSubTask);

router
    .route("/:SubTaskId")
    .patch(
        isLoggedIn,
        updateSubTaskValidator(),
        validate,
        updateSubTask,
    )
    .delete(
        isLoggedIn,
        paginateSubTasksValidator(),
        validate,
        deleteSubTask,
    );

export default router;
