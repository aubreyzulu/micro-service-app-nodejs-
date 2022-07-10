import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import morgan from 'morgan';

import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@stark-innovations/common';
import { createTicketRouter } from './routes/new';
import { getTicketRouter } from './routes/show';

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
app.use(createTicketRouter);
app.use(getTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});
// error handling middleware
app.use(errorHandler);

export { app };
