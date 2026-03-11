import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

/**
 * Middleware to check if the authenticated user is a member of the project.
 * Attaches projectMember info to req.
 */
export const checkProjectMembership = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const member = project.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!member) {
    throw new ApiError(403, "You are not a member of this project");
  }

  req.project = project;
  req.projectMember = member;
  next();
});

/**
 * Middleware factory: only allows users with the given roles in the project.
 * Must be used AFTER checkProjectMembership.
 */
export const checkProjectRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.projectMember) {
      throw new ApiError(403, "Project membership not verified");
    }
    if (!roles.includes(req.projectMember.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }
    next();
  };
