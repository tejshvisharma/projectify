import mongoose, {Schema} from "mongoose";
import { User } from "./user.models.js";

const projectNotesSchema = new Schema({
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true
    },
     mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],

},{timestamps:true})


export const note = mongoose.model("note",projectNotesSchema);
