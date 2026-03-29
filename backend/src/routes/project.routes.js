import { Router } from "express";

import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import {
  addProjectMember,
  deleteProjectMember,
  getProjectById,
  getProjectMembers,
  updateProjectMemberRole,
} from "../controllers/project.controllers.js";

import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/project.controllers.js";

import {
  addMemberToProjectValidator,
  updateProjectMemberRoleValidator,
  createProjectValidator,
} from "../validators/auth.validators.js";

import { validate } from "../middlewares/validate.middleware.js";

import { PROJECT_ROLES, userRolesEnum } from "../utils/constants.js";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/task.controllers.js";
import {
  createTaskValidator,
  updateTaskValidator,
  verifyTaskValidator,
} from "../validators/task.validators.js";

import {
  getNotes,
  createNote,
  updateNote,
  getMyMentions,
  deleteNote,
  getNoteById,
} from "../controllers/note.controllers.js";

import {
  createNoteValidator,
  updateNoteValidator,
} from "../validators/notesValidators.js";

import { uploadTaskAttachments } from "../middlewares/upload.middleware.js";
import { submitTask, verifyTask } from "../controllers/task.submit-verify.controller.js";

const router = Router();

// for projects routing :

router
  .route("/")
  .post(isLoggedIn, createProjectValidator(), validate, createProject)
  .get(isLoggedIn, getProjects);

router
  .route("/:projectId")
  .get(isLoggedIn, getProjectById)
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateProject,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission([userRolesEnum.OWNER]),
    deleteProject,
  );

// for project Member routing :
router
  .route("/:projectId/members")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getProjectMembers,
  )
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    addMemberToProjectValidator(),
    validate,
    addProjectMember,
  );

router
  .route("/:projectId/members/:memberId")
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateProjectMemberRoleValidator,
    validate,
    updateProjectMemberRole,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteProjectMember,
  );

// for tasks routing :
router
  .route("/:projectId/tasks")
  .get(isLoggedIn, validateProjectPermission(PROJECT_ROLES.VIEWERS), getTasks)
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    uploadTaskAttachments.array("attachments", 5),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/:projectId/tasks/:taskId")
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    uploadTaskAttachments.array("attachments", 5),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteTask,
  );

router
  .route("/:projectId/tasks/:taskId/submit")
  .patch(
  isLoggedIn,
  validateProjectPermission(PROJECT_ROLES.EDITORS), // ensures user is a member at all
  uploadTaskAttachments.array("attachments", 5),
  submitTask,
  );

router
  .route("/:projectId/tasks/:taskId/verify")
  .patch(
  isLoggedIn,
  validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
  verifyTaskValidator(),
  verifyTask, 
 );

  // for notes routing:

router
  .route("/:projectId/notes")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getNotes,
  )
  .post(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    createNoteValidator(),
    validate,
    createNote,
  );

router
  .route("/:projectId/notes/:noteId")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getNoteById,
  )
  .patch(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateNoteValidator(),
    validate,
    updateNote,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    validate,
    deleteNote,
  );

router
  .route("/:projectId/notes/mentions/me")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getMyMentions,
  );
export default router;
