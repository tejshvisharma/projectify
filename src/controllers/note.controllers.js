import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import User from "../models/user.models.js";
import { project as Project } from "../models/project.models.js";
import { note as Note } from "../models/notes.models.js";


const extractMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((match) => match.substring(1)) : [];
};

const createNoteAndSave = asyncHandler(
  async (projectId, createdBy, content) => {
    const mentionedUsernames = extractMentions(content);

    const mentionedUsers = await User.find({
      username: { $in: mentionedUsernames },
    });

    const mentions = mentionedUsers.map((user) => ({ user: user._id }));

    const newNote = new Note({
      project: projectId,
      createdBy,
      content,
      mentions,
    });

    await newNote.save();

    return await Note.findById(newNote._id)
      .populate("createdBy", "avatar username email")
      .populate("mentions.user", "avatar username email");
  },
);

const updateNoteAndSave = asyncHandler(async (noteId, content, userId) => {
  // Find the note first
  const existingNote = await Note.findById(noteId);
  if (!existingNote) {
    throw new Error("Note not found");
  }

  if (existingNote.createdBy.toString() !== userId.toString()) {
    throw new Error("Unauthorized: Only the creator can update this note");
  }

  // Extract new mentions
  const mentionedUsernames = extractMentions(content);
  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames },
  });

  const mentions = mentionedUsers.map((user) => ({ user: user._id }));

  // Update the note
  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    {
      content,
      mentions,
      $set: { updatedAt: new Date() },
    },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "username email firstName lastName")
    .populate("mentions.user", "username email firstName lastName");

  return updatedNote;
});

export const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

   const createdBy = req.user._id;

   const newNote = await createNoteAndSave(projectId, createdBy, content);

   return res
        .status(201)
        .json(new ApiResponse(
            201,
            newNote,
            "Note created successfully"
        ));

});

export const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

  const allNotes = await Note.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate("createdBy", " _id avatar username")
    .populate("mentions.user", "_id avatar username")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, allNotes, "Project notes fetched successfully"));
});

export const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) throw new ApiError(404, "Project not found");

 const noteDoc = await Note
   .findById(noteId)
   .populate("createdBy", "avatar username email")
   .populate("mentions.user", "avatar username email")
   .populate("project", "name");

 if (!noteDoc) {
   throw new ApiError(404,"Note not found");
 }

return res
  .status(200)
  .json(new ApiResponse(200, noteDoc, "Project note fetched successfully"));

});

export const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const { content } = req.body;

  const userId = req.user._id;

  const updatedNote = updateNoteAndSave(noteId, content, userId);

  return res
    .status(200)
    .json(new ApiResponse(
        200,
        updatedNote,
        "Note updated successfully"
    ));
});

export const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const userId = req.user._id;

    const noteDoc = await Note.findById(noteId);

    if (!noteDoc) {
      throw new Error("Note not found");
    }

    if (noteDoc.createdBy.toString() !== userId.toString()) {
      throw new Error("Unauthorized: Only the creator can delete this Note");
    }

    await Note.findByIdAndDelete(noteId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Note deleted successfully"
        ))

});

export const getMyMentions = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const notes = await Note.find({ "mentions.user": userId })
    .populate("createdBy", "avatar username email")
    .populate("project", "name")
    .populate("mentions.user", "avatar username email")
    .sort({ createdAt: -1 });

  if (!notes) {
    throw new ApiError(404, "No Notes found where user is mentioned");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Mentioning Notes fetched successfully"));
});




