import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@stark-innovations/common';
import express from 'express';
import { Order } from '../models/orders';

const router = express.Router();

router.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }
  /** if not owner of the order */
  if (order.userId !== req.user!.id) {
    throw new NotAuthorizedError();
  }

  res.status(200).send({ message: 'orders found', order });
});

export { router as getOrderRouter };
