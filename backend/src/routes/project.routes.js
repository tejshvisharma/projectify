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
import { getProjectLeaderboard } from "../controllers/leaderboard.controller.js";
import {
  createTaskValidator,
  updateTaskValidator,
  verifyTaskValidator,
} from "../validators/task.validators.js";
import {
  deleteProjectInviteValidator,
  inviteOrAddProjectMemberValidator,
} from "../validators/projectInvite.validators.js";

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
import {
  submitTask,
  verifyTask,
} from "../controllers/task.submit-verify.controller.js";
import {
  deleteProjectInvite,
  inviteOrAddProjectMember,
} from "../controllers/projectInvite.controller.js";

import { doubleCsrfProtection } from "../utils/csrf.js";
const router = Router();

// for projects routing :

router
  .route("/")
  .post(
    isLoggedIn,
    doubleCsrfProtection,
    createProjectValidator(),
    validate,
    createProject,
  )
  .get(isLoggedIn, getProjects);

router
  .route("/:projectId")
  .get(isLoggedIn, getProjectById)
  .patch(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateProject,
  )
  .delete(
    isLoggedIn,
    doubleCsrfProtection,
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
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    addMemberToProjectValidator(),
    validate,
    addProjectMember,
  );

router
  .route("/:projectId/members/:memberId")
  .patch(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateProjectMemberRoleValidator,
    validate,
    updateProjectMemberRole,
  )
  .delete(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteProjectMember,
  );

router
  .route("/:projectId/members/invite")
  .post(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    inviteOrAddProjectMemberValidator(),
    validate,
    inviteOrAddProjectMember,
  );

router
  .route("/:projectId/invites/:inviteId")
  .delete(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteProjectInviteValidator(),
    validate,
    deleteProjectInvite,
  );

// for tasks routing :
router
  .route("/:projectId/tasks")
  .get(isLoggedIn, validateProjectPermission(PROJECT_ROLES.VIEWERS), getTasks)
  .post(
    isLoggedIn,
    doubleCsrfProtection,
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
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    uploadTaskAttachments.array("attachments", 5),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteTask,
  );

router.route("/:projectId/tasks/:taskId/submit").patch(
  isLoggedIn,
  doubleCsrfProtection,
  validateProjectPermission(PROJECT_ROLES.EDITORS), // ensures user is a member at all
  uploadTaskAttachments.array("attachments", 5),
  submitTask,
);

router
  .route("/:projectId/tasks/:taskId/verify")
  .patch(
    isLoggedIn,
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    verifyTaskValidator(),
    validate,
    verifyTask,
  );

router
  .route("/:projectId/leaderboard")
  .get(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.VIEWERS),
    getProjectLeaderboard,
  );

// for notes routing:

router
  .route("/:projectId/notes")
  .get(isLoggedIn, validateProjectPermission(PROJECT_ROLES.VIEWERS), getNotes)
  .post(
    isLoggedIn,
    doubleCsrfProtection,
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
    doubleCsrfProtection,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    updateNoteValidator(),
    validate,
    updateNote,
  )
  .delete(
    isLoggedIn,
    doubleCsrfProtection,
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
