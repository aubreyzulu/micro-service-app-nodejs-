import express from 'express';

const router = express.Router();

router.delete('/api/orders/:id', async (req, res) => {
  res.status(200).send({ message: 'orders deleted' });
});

export { router as deleteOrderRouter };
