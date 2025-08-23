import mongoose, {Schema} from "mongoose";
import { availableTaskStatus, taskStatusEnums } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  availableTaskDifficulties,
  taskDifficultyEnums,
  taskPriorityEnums,
  availableTaskPriorities,
} from "../utils/constants.js";
const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
      type: [
        {
          type: String,
          MimeType: String,
          size: Number,
        },
      ],
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


taskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  asyncHandler(async function (next) {
    const taskId = this._id;

    await mongoose.model("note").deleteMany({ task: taskId });

     await mongoose.model("subTask").deleteMany({ task: taskId });
    next();
  }),
);

export const task = mongoose.model("Task",taskSchema);
