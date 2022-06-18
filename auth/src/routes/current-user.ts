import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/current-user', (req: Request, res: Response) => {
  if (req.session && !req.session.jwt) {
    return res.status(401).send({ message: 'Unauthenticated', user: null });
  }

  try {
    const payload = jwt.verify(req.session?.jwt, process.env.JWT_KEY!);
    res.status(200).send({ user: payload });
  } catch (error) {
    return res.status(401).send({ message: 'Unauthenticated', user: null });
  }
});

export { router as currentUserRouter };
