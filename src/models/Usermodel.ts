import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
    _id: string;
    name: string;
    photo: string;
    email: string;
    role: "user" | "admin";
    gender: string;
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number;
}

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "Please add id"]
    },
    name: {
        type: String,
        required: [true, "Please add name"]
    },
    photo: {
        type: String,
        required: [true, "Please add photo"]
    },
    email: {
        type: String,
        unique: [true, "Email already existed"],
        required: [true, "Please add email"],
        validate: validator.default.isEmail,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please add gender"],
    },
    dob: {
        type: Date,
        required: [true, "please add date of birth heres"]
    }
},{timestamps: true})
userSchema.virtual('age').get(function(){
    const today = new Date();
    const dob:any = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if(today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()){
        age--;
    }
    return age;
})

const User = mongoose.model<IUser>("user", userSchema);
export default User;