import { Router } from "express";
import {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  checkProjectMembership,
  checkProjectRole,
} from "../middlewares/project.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
} from "../validators/project.validators.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

// Task routes
router
  .route("/:projectId")
  .get(checkProjectMembership, getProjectTasks)
  .post(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    upload.array("attachments", 5),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/:projectId/t/:taskId")
  .get(checkProjectMembership, getTaskById)
  .put(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    upload.array("attachments", 5),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    deleteTask,
  );

// Subtask routes
router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    createSubTaskValidator(),
    validate,
    createSubTask,
  );

router
  .route("/:projectId/st/:subTaskId")
  .put(
    checkProjectMembership,
    updateSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN),
    deleteSubTask,
  );

export default router;
