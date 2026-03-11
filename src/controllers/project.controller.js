import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

// GET /api/v1/projects/
const getUserProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    "members.user": req.user._id,
  })
    .populate("createdBy", "username email fullName avatar")
    .lean();

  const projectsWithMemberCount = projects.map((p) => ({
    ...p,
    memberCount: p.members.length,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { projects: projectsWithMemberCount },
        "Projects fetched successfully",
      ),
    );
});

// POST /api/v1/projects/
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: UserRolesEnum.ADMIN }],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { project }, "Project created successfully"));
});

// GET /api/v1/projects/:projectId
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId)
    .populate("createdBy", "username email fullName avatar")
    .populate("members.user", "username email fullName avatar");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project fetched successfully"));
});

// PUT /api/v1/projects/:projectId
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { $set: { name, description } },
    { new: true, runValidators: true },
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project updated successfully"));
});

// DELETE /api/v1/projects/:projectId
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

// GET /api/v1/projects/:projectId/members
const getProjectMembers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate(
    "members.user",
    "username email fullName avatar",
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { members: project.members },
        "Members fetched successfully",
      ),
    );
});

// POST /api/v1/projects/:projectId/members
const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const isAlreadyMember = project.members.some(
    (m) => m.user.toString() === user._id.toString(),
  );

  if (isAlreadyMember) {
    throw new ApiError(409, "User is already a member of this project");
  }

  project.members.push({ user: user._id, role: role || UserRolesEnum.MEMBER });
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member added successfully"));
});

// PUT /api/v1/projects/:projectId/members/:userId
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const member = project.members.find((m) => m.user.toString() === userId);

  if (!member) {
    throw new ApiError(404, "Member not found in this project");
  }

  member.role = role;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member role updated successfully"));
});

// DELETE /api/v1/projects/:projectId/members/:userId
const removeMemberFromProject = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const memberIndex = project.members.findIndex(
    (m) => m.user.toString() === userId,
  );

  if (memberIndex === -1) {
    throw new ApiError(404, "Member not found in this project");
  }

  // Prevent removing the only admin
  if (project.members[memberIndex].role === UserRolesEnum.ADMIN) {
    const adminCount = project.members.filter(
      (m) => m.role === UserRolesEnum.ADMIN,
    ).length;
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot remove the only admin from the project");
    }
  }

  project.members.splice(memberIndex, 1);
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});

export {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMemberToProject,
  updateMemberRole,
  removeMemberFromProject,
};
