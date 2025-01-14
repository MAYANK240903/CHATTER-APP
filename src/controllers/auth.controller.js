// src/controllers/auth.controller.js

import bcrypt from 'bcrypt';
import { userModel } from '../models/user.model.js';

export const loginUser = async (data, io, connectedUsers) => { // Accept io and connectedUsers as arguments
  const { username, email, password } = data;

  try {
    // Check if user exists
    const user = await userModel.findOne({ email });

    if (user) {
      // User exists, verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Password is valid, proceed with login
        io.username = user.username;
        connectedUsers.push({ username: io.username });
        io.emit('user_joined', { username: io.username, connectedUsers });
        // Redirect to index.html
        io.emit('redirect', '/index.html' + "?name=" + user.username + "&id=" + user.id);
      } else {
        // Invalid password
        io.emit('login_error', 'Invalid password');
      }
    } else {
      // User does not exist, create a new one
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({ username, email, password: hashedPassword });
      const savedUser = await newUser.save();

      // Proceed with login
      io.username = username;
      connectedUsers.push({ username: io.username });
      io.emit('user_joined', { username: io.username, connectedUsers });
      console.log('User created successfully');
      // Redirect to index.html
      io.emit('redirect', '/index.html' + "?name=" + savedUser.username + "&id=" + savedUser.id);
    }
  } catch (error) {
    console.error(error);
    io.emit('login_error', 'An error occurred during login');
  }
};