import mongoose, {Schema} from "mongoose";

const projectSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    description:{
        type:String,
        required: true,
    }
},{timestamps:true})


export const project = mongoose.model("project",projectSchema);
