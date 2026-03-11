import { Router } from "express";
import {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMemberToProject,
  updateMemberRole,
  removeMemberFromProject,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  checkProjectMembership,
  checkProjectRole,
} from "../middlewares/project.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  updateMemberRoleValidator,
} from "../validators/project.validators.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

// All project routes require authentication
router.use(verifyJWT);

router
  .route("/")
  .get(getUserProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(checkProjectMembership, getProjectById)
  .put(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    updateProjectValidator(),
    validate,
    updateProject,
  )
  .delete(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    deleteProject,
  );

router
  .route("/:projectId/members")
  .get(checkProjectMembership, getProjectMembers)
  .post(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    addMemberValidator(),
    validate,
    addMemberToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    updateMemberRoleValidator(),
    validate,
    updateMemberRole,
  )
  .delete(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    removeMemberFromProject,
  );

export default router;
