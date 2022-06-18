import express, { Express, Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/sign-out', (req: Request, res: Response) => {
  res.status(200).send({
    name: 'John Doe',
    email: '',
  });
});

export { router as signoutRouter };