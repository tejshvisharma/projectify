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
  addProjectMemberValidator,
  updateProjectMemberRoleValidator,
} from "../validators/project.validators.js";

import { validate } from "../middlewares/validate.middleware.js";

import { PROJECT_ROLES } from "../utils/constants.js";

const router = Router();

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
    addProjectMemberValidator(),
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
