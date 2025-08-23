import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: {
      type: [String], // Store URLs of files/images
      default: [],
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("comment", commentSchema);
