import mongoose, {Schema} from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    endDate: Date,
    githubRepo: {
      type: String,
    },
    tags: [String],
  },
  { timestamps: true },
);


projectSchema.pre(
  "deleteOne",
  { document: true, query: false },
  asyncHandler(async function (next)  {
    const projectId = this._id;

    // Delete all members of this project
    await mongoose.model("projectMember").deleteMany({ project: projectId });

    // Find all tasks of this project
    const tasks = await mongoose.model("task").find({ project: projectId });

    // Delete all comments of each task
    const taskIds = tasks.map((t) => t._id);
    if (taskIds.length > 0) {
      await mongoose.model("comment").deleteMany({ task: { $in: taskIds } });
    }

    // Delete tasks themselves
    await mongoose.model("task").deleteMany({ project: projectId });

    // Delete all Notes of this project
    await mongoose.model("note").deleteMany({ project: projectId });
    next();
  }),
);



export const project = mongoose.model("project",projectSchema);
