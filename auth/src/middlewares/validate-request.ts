import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

/**
 *  Checks if there are any validation errors
 * */
export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  // If there are errors, return 400 with errors object
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};
