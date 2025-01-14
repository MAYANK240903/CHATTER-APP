// src/utils/socket.js
import { loadMessages, sendMessage } from '../controllers/chat.controller.js';

export const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('Connection is established');

    socket.on('user_connected', async (id) => {
      loadMessages(id, socket);
    });

    socket.on('new_message', async (message) => {
      sendMessage(message, socket, io);
    });

    // ... (other event handlers)
  });
};