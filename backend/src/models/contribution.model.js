import mongoose, { Schema } from "mongoose";

const contributionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      unique: true, // one contribution per task
    },

    creditsEarned: {
      type: Number,
      required: true,
    },

    maxCredits: {
      type: Number,
      required: true,
    },

    isOnTime: {
      type: Boolean,
      required: true,
    },

    status: {
      type: String,
      enum: ["approved", "rejected"],
      required: true,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verifiedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

contributionSchema.index({ project: 1, user: 1 });
 
const  Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;