import express, { Express, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';
import { requestValidator } from '../middlewares/validate-request';

const router = express.Router();

router.post(
  '/api/users/sign-up',
  [
    body('email').trim().isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  requestValidator,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('User already exists with this email');
    }

    const user = new User({ email, password });
    await user.save();

    // Generate JWT
    const userJWT = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    // Store it in session
    req.session = {
      jwt: userJWT,
    };

    // Create a user
    res.status(201).send({
      message: 'User created',
      user,
    });
  }
);

export { router as signupRouter };