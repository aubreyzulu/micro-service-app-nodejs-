import express from 'express';

const router = express.Router();

router.get('/api/orders/:id', async (req, res) => {
  res.status(200).send({ message: 'orders found' });
});

export { router as getOrderRouter };
