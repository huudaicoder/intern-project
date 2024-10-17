import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import adminsRoute from './routes/admins.js';
import usersRoute from './routes/users.js';
import groupsRoute from './routes/groups.js';
import channelsRoute from './routes/channels.js';
import programsRoute from './routes/programs.js';

const app = express();
dotenv.config();

// connect mongoDB
const connect = async () => {
  try {
    mongoose.connect(process.env.MONGO);
    console.log('Connected to mongoDB');
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB is disconnected!');
});

// middlewares
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/admins', adminsRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/channels', channelsRoute);
app.use('/api/v1/programs', programsRoute);
app.use('/api/v1/groups', groupsRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || 'Something went wrong!';

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(3000, () => {
  connect();
  console.log('Connected to backend!');
});

export default app;
