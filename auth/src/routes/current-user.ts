import express, { Request, Response } from 'express';
import { currentUser } from '../middlewares/current-user';

const router = express.Router();

router.get(
  '/api/users/current-user',
  currentUser,
  (req: Request, res: Response) => {
    res.status(200).send({ user: req.user || null });
  }
);

export { router as currentUserRouter };
