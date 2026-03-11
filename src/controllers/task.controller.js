import path from "path";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";

// GET /api/v1/tasks/:projectId
const getProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate("assignedTo", "username email fullName avatar")
    .populate("assignedBy", "username email fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { tasks }, "Tasks fetched successfully"));
});

// POST /api/v1/tasks/:projectId
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const attachments =
    req.files?.map((file) => ({
      url: `/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    })) || [];

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo: assignedTo || null,
    assignedBy: req.user._id,
    status,
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

// GET /api/v1/tasks/:projectId/t/:taskId
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  })
    .populate("assignedTo", "username email fullName avatar")
    .populate("assignedBy", "username email fullName avatar");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTasks = await SubTask.find({ task: task._id }).populate(
    "createdBy",
    "username email fullName avatar",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { task, subTasks }, "Task fetched successfully"),
    );
});

// PUT /api/v1/tasks/:projectId/t/:taskId
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;

  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Handle new file attachments
  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map((file) => ({
      url: `/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));
    task.attachments.push(...newAttachments);
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  if (status !== undefined) task.status = status;

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task updated successfully"));
});

// DELETE /api/v1/tasks/:projectId/t/:taskId
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Delete associated subtasks
  await SubTask.deleteMany({ task: task._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

// POST /api/v1/tasks/:projectId/t/:taskId/subtasks
const createSubTask = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const task = await Task.findOne({
    _id: req.params.taskId,
    project: req.params.projectId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await SubTask.create({
    title,
    task: task._id,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { subTask }, "Subtask created successfully"));
});

// PUT /api/v1/tasks/:projectId/st/:subTaskId
const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;

  const subTask = await SubTask.findById(req.params.subTaskId);

  if (!subTask) {
    throw new ApiError(404, "Subtask not found");
  }

  // Verify subtask belongs to a task in this project
  const task = await Task.findOne({
    _id: subTask.task,
    project: req.params.projectId,
  });

  if (!task) {
    throw new ApiError(404, "Subtask does not belong to this project");
  }

  if (title !== undefined) subTask.title = title;
  if (isCompleted !== undefined) subTask.isCompleted = isCompleted;

  await subTask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { subTask }, "Subtask updated successfully"));
});

// DELETE /api/v1/tasks/:projectId/st/:subTaskId
const deleteSubTask = asyncHandler(async (req, res) => {
  const subTask = await SubTask.findById(req.params.subTaskId);

  if (!subTask) {
    throw new ApiError(404, "Subtask not found");
  }

  const task = await Task.findOne({
    _id: subTask.task,
    project: req.params.projectId,
  });

  if (!task) {
    throw new ApiError(404, "Subtask does not belong to this project");
  }

  await SubTask.findByIdAndDelete(req.params.subTaskId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});

export {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
