import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import morgan from 'morgan';

import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@stark-innovations/common';
import { createOrderRouter } from './routes/new';
import { getOrdersRouter } from './routes';
import { getOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(morgan('dev'));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
app.use(createOrderRouter);
app.use(getOrdersRouter);
app.use(getOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

/**
 * Error handler middleware
 */
app.use(errorHandler);

export { app };
