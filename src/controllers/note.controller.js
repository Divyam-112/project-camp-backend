import { Note } from "../models/note.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";

// GET /api/v1/notes/:projectId
const getProjectNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ project: req.params.projectId })
    .populate("createdBy", "username email fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { notes }, "Notes fetched successfully"));
});

// POST /api/v1/notes/:projectId
const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.create({
    title,
    content,
    project: req.params.projectId,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { note }, "Note created successfully"));
});

// GET /api/v1/notes/:projectId/n/:noteId
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    project: req.params.projectId,
  }).populate("createdBy", "username email fullName avatar");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { note }, "Note fetched successfully"));
});

// PUT /api/v1/notes/:projectId/n/:noteId
const updateNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.noteId, project: req.params.projectId },
    { $set: { title, content } },
    { new: true, runValidators: true },
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { note }, "Note updated successfully"));
});

// DELETE /api/v1/notes/:projectId/n/:noteId
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.noteId,
    project: req.params.projectId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

export { getProjectNotes, createNote, getNoteById, updateNote, deleteNote };
