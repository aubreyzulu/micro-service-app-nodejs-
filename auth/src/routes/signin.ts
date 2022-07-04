import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@stark-innovations/common';

import { requestValidator } from '@stark-innovations/common';
import { User } from '../models/user';
import { Password } from '../services/password';
const router = express.Router();

router.post(
  '/api/users/sign-in',
  [
    body('email').trim().isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password must be provided'),
  ],
  requestValidator,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }
    // Check if password is correct
    const passwordMatch = await Password.compare(user.password, password);

    // If password does not match, throw error
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate JWT
    const userJWT = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );
    // Store it in session
    req.session = {
      jwt: userJWT,
    };

    res.status(200).send({
      message: 'User signed in successfully',
      user,
    });
  }
);

export { router as signinRouter };
