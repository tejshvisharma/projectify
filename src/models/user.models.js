import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    avatar:{
        type:{
            url:String,
            localPath:String
        },
        default:{
            url:`https://placehold.co/600x400`,
            localPath: ""
        }
    },
    username:{
        type: String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
    },
    fullName:{
        type: String,
        required:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type: String,
        required: [true,"password is required"]
    },
    isEmailVerified:{
        type: Boolean
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type: Date
    },
    resetToken:{
        type: String
    },
    forgetPasswordToken:{
        type:String
    },
    forgetPasswordExpiry:{
        type: Date
    },
    refreshToken:{
        type:String
    },
    lastVerificationEmailSentAt:{
        type:Date
    },
    verificationEmailCount:{
        Number
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password,10);
        next();
    }
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
};

userSchema.methods.generateTemporaryToken = async function(){
    const unHashedToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken).digest("hex")    
    const tokenExpiry = Date.now() + (20*60*1000) //  20 minutes
    return {
        hashedToken,
        unHashedToken,
        tokenExpiry
    }     
}
const User = mongoose.model("User",userSchema);
export default User;
