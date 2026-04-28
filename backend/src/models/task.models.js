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
    url: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "raw",
    },

    mimeType: {
      type: String,
      required: true,
    },

    format: {
      type: String, // jpg, png, pdf, docx
    },

    extension: {
      type: String, // pdf, zip, mp4
    },

    size: {
      type: Number, // bytes
    },

    originalName: {
      type: String,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
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
    },
    submission: {
      comment: { type: String, default: "" },
      attachments: { type: [attachmentSchema], default: [] },
      submittedAt: Date,
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: Date,
    },
    rejection: {
      reason: String,
      rejectedAt: Date,
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
taskSchema.index({ assignedTo: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, dueDate: 1, status: 1 });
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
