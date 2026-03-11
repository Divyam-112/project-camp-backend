import { Router } from "express";
import {
  getProjectNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  checkProjectMembership,
  checkProjectRole,
} from "../middlewares/project.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  createNoteValidator,
  updateNoteValidator,
} from "../validators/project.validators.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(checkProjectMembership, getProjectNotes)
  .post(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    createNoteValidator(),
    validate,
    createNote,
  );

router
  .route("/:projectId/n/:noteId")
  .get(checkProjectMembership, getNoteById)
  .put(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    updateNoteValidator(),
    validate,
    updateNote,
  )
  .delete(
    checkProjectMembership,
    checkProjectRole(UserRolesEnum.ADMIN),
    deleteNote,
  );

export default router;
