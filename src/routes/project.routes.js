import { Router } from "express";

import {
  isLoggedIn,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import {
  addProjectMember,
  deleteProjectMember,
  getProjectMembers,
  updateProjectMemberRole
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
} from "../validators/project.validators.js";

import { validate } from "../middlewares/validate.middleware.js";

import { PROJECT_ROLES } from "../utils/constants.js";

const router = Router();

router.route("/")
  .post(isLoggedIn, createProjectValidator(), validate, createProject) 
  .get(isLoggedIn, getProjects); 

router
  .route("/:projectId")
  .put(isLoggedIn, validateProjectPermission(PROJECT_ROLES.MANAGEMENT), updateProject)
  .delete(isLoggedIn, deleteProject);


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
    updateProjectMemberRoleValidator(), 
    validate,
    updateProjectMemberRole,
  )
  .delete(
    isLoggedIn,
    validateProjectPermission(PROJECT_ROLES.MANAGEMENT),
    deleteProjectMember,
  );

export default router;
