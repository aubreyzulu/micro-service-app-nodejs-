import express, { Express, Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/sign-in', (req: Request, res: Response) => {
  res.status(200).send({
    name: 'John Doe',
    email: '',
  });
});

export { router as signinRouter };
