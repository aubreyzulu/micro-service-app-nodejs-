import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import morgan from 'morgan';

import { NotFoundError, errorHandler } from '@stark-innovations/common';

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
// app.use(currentUserRouter);
// app.use(signinRouter);
// app.use(signoutRouter);
// app.use(signupRouter);

// Not found handler

app.all('*', async () => {
  throw new NotFoundError();
});
// error handling middleware
app.use(errorHandler);

export { app };
