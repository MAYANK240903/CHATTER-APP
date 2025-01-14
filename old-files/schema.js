import mongoose, { Mongoose } from 'mongoose';

const chatSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: String,
    message: String,
    timestamp: Date,
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String
});

export const userModel = mongoose.model("User", userSchema);
export const chatModel = mongoose.model("Chat", chatSchema);