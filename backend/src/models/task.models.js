import mongoose, { Schema } from "mongoose";
import { availableTaskStatus, taskStatusEnums } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  availableTaskDifficulties,
  taskDifficultyEnums,
  taskPriorityEnums,
  availableTaskPriorities,
} from "../utils/constants.js";

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true }, // secure url
    public_id: { type: String, required: true }, // for later delete
    resource_type: { type: String }, // image, raw, video
    bytes: { type: Number }, // size in bytes
    format: { type: String }, // jpg, png, pdf...
    original_filename: { type: String }, // client filename
    mimeType: { type: String }, // request mime type
  },
  { _id: false },
);

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: availableTaskStatus,
      default: taskStatusEnums.TODO,
      required: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    priority: {
      type: String,
      enum: availableTaskPriorities,
      default: taskPriorityEnums.MEDIUM,
    },
    difficulty: {
      type: String,
      enum: availableTaskDifficulties,
      default: taskDifficultyEnums.MEDIUM,
    },
    credits: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Indexes for frequently queried fields
taskSchema.index({ project: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });

taskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  asyncHandler(async function (next) {
    const taskId = this._id;

    await mongoose.model("comment").deleteMany({ task: taskId });

    await mongoose.model("subTask").deleteMany({ task: this._id });

    next();
  }),
);

export const task = mongoose.model("Task", taskSchema);
