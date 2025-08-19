import mongoose, {Schema} from "mongoose";
import {availableUserRoles,userRolesEnum} from "../utils/constants.js"
const projectMemberSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    role:{
        type:String,
        enum:availableUserRoles,
        default:userRolesEnum.VIEWER,
        required: true
    }
},{timestamps:true})


projectMemberSchema.index({ user: 1, project: 1 }, { unique: true });


export const projectMember = mongoose.model("projectMember",projectMemberSchema);
