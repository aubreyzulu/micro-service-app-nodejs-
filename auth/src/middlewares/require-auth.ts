import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If there is no session
  if (!req.user) {
    throw new NotAuthorizedError();
  }
  // If there is a session
  next();
};
