// src/config/db.js

import mongoose from 'mongoose';

export const connect = async()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/chatApp", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Db is connected");
}

