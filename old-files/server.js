import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { connect } from './config.js';
import { chatModel } from './schema.js';
import { userModel } from './schema.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const app = express();

// 1. Creating server using http.
const server = http.createServer(app);

// 2. Create socket server.
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

// 3. Use socket events.
let connectedUsers = [];
let user;

io.on('connection', (socket) => {
    console.log("Connection is established");

    socket.on("login", async (data) => {
        const { username, email, password } = data;

        try {
            // Check if user exists
            const user = await userModel.findOne({ email });

            if (user) {
                // User exists, verify password
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (isPasswordValid) {
                    // Password is valid, proceed with login
                    socket.username = user.username;
                    connectedUsers.push({ username: socket.username });
                    io.emit('user_joined', { username: socket.username, connectedUsers: connectedUsers });
                    //console.log(user);
                    // Redirect to index.html
                    socket.emit('redirect', '/index.html'+"?name="+user.username+"&id="+user.id);
                } else {
                    // Invalid password
                    
                    socket.emit('login_error', 'Invalid password');
                }
            } else {
                // User does not exist, create a new one
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = new userModel({ username, email, password: hashedPassword });
                const savedUser= await newUser.save();

                // Proceed with login
                socket.username = username;
                connectedUsers.push({ username: socket.username });
                io.emit('user_joined', { username: socket.username, connectedUsers: connectedUsers });
                console.log('User created successfully');
                // Redirect to index.html
                socket.emit('redirect', '/index.html'+"?name="+savedUser.username+"&id="+savedUser.id);
            }
        } catch (error) {
            console.error(error);
            socket.emit('login_error', 'An error occurred during login');
        }
    });

    socket.on("user_connected", async (id) => {
        try{
            user = await userModel.findById(id);
            //let msgs = await chatModel.find({ username: user._id }).limit(10).sort({ timestamp: -1 });
            let msgs = await chatModel.find().sort({ timestamp: 1 }).limit(10);
            console.log(msgs);
            socket.emit('load_messages', msgs);
        }catch(error){
            console.log(error);
        }
    });

    socket.on('new_message', async (message) => {
        try{
            //let user2 = await userModel.findById(message.uid);
            
            
            const userMessage = {
                username: user.username,
                message: message.message,
                // profilePicture: socket.profilePicture
            }

            const newChat = new chatModel({
                userid: user._id,
                username: user.username,
                message: message.message,
                timestamp: new Date(),
                // profilePicture: socket.profilePicture
            });
            await newChat.save();

            // broadcast this message to all the clients.
            socket.broadcast.emit('broadcast_message', userMessage);
        }catch(e){
            console.log(e);
        }
    })

    socket.on('typing', () => {
        socket.broadcast.emit('typing', { username: user.username });
    });

    socket.on('disconnect', () => {
        console.log("Connection is disconnected");
        connectedUsers = connectedUsers.filter(user => user.username !== socket.username);
        io.emit('user_left', { username: socket.username, connectedUsers: connectedUsers });
    })
});

server.listen(3000, () => {
    console.log("App is listening on 3000");
    connect();
})