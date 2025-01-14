// src/app.js
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import {connect } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import { setupSocketEvents } from './src/utils/socket.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());

// Use route files
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

setupSocketEvents(io);

server.listen(3000, () => {
  console.log('App is listening on 3000');
  connect();
});