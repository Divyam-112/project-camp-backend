import { body } from "express-validator";
import { AvailableUserRole, AvailableTaskStatues } from "../utils/constants.js";

const createProjectValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("description").optional().trim(),
  ];
};

const updateProjectValidator = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project name cannot be empty"),
    body("description").optional().trim(),
  ];
};

const addMemberValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role").optional().isIn(AvailableUserRole).withMessage("Invalid role"),
  ];
};

const updateMemberRoleValidator = () => {
  return [
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Invalid role"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("description").optional().trim(),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    body("status")
      .optional()
      .isIn(AvailableTaskStatues)
      .withMessage("Invalid status"),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty"),
    body("description").optional().trim(),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    body("status")
      .optional()
      .isIn(AvailableTaskStatues)
      .withMessage("Invalid status"),
  ];
};

const createSubTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Subtask title is required"),
  ];
};

const updateSubTaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subtask title cannot be empty"),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean"),
  ];
};

const createNoteValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Note title is required"),
    body("content").optional().trim(),
  ];
};

const updateNoteValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Note title cannot be empty"),
    body("content").optional().trim(),
  ];
};

export {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  updateMemberRoleValidator,
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
  createNoteValidator,
  updateNoteValidator,
};
