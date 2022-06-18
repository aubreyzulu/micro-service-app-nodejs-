import express, { Express, Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/sign-out', (req: Request, res: Response) => {
  req.session = null;

  res.status(200).send({ message: 'User signed out successfully' });
});

export { router as signoutRouter };
