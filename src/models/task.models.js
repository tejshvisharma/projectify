import mongoose, {Schema} from "mongoose";
import { availableTaskStatus, taskStatusEnums } from "../utils/constants";

const taskSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
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
    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:availableTaskStatus,
        default:taskStatusEnums.TODO,
        required:true
    },
    attachments:{
        type:[{
            type: String,
            MimeType: String,
            size:Number
        }],
        default: []
    }
},{timestamps:true})


export const task = mongoose.model("Task",taskSchema);
