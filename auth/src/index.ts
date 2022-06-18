import cookieSession from 'cookie-session';
import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import morgan from 'morgan';

import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(morgan('dev'));
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Not found handler

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});
// error handling middleware
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Error connecting to MongoDB', error);
  }
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

start();
