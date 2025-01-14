//src/models/user.model.js

import mongoose from "mongoose";
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
