// src/controllers/chat.controller.js

import { userModel } from '../models/user.model.js';
import { chatModel } from '../models/chat.model.js';

export const loadMessages = async (id, socket) => {
  try {
    const user = await userModel.findById(id);
    const messages = await chatModel.find().sort({ timestamp: 1 }).limit(10);
    socket.emit('load_messages', messages);
  } catch (error) {
    console.log(error);
  }
};

export const sendMessage = async (message, socket, io) => {
  try {
    const userMessage = {
      username: socket.user.username,
      message: message.message,
    };

    const newChat = new chatModel({
      userid: socket.user._id,
      username: socket.user.username,
      message: message.message,
      timestamp: new Date(),
    });
    await newChat.save();

    socket.broadcast.emit('broadcast_message', userMessage);
  } catch (error) {
    console.log(error);
  }
};