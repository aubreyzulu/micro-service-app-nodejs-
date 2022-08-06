import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@stark-innovations/common';
import express from 'express';
import { Order } from '../models/orders';

const router = express.Router();

router.delete('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new NotFoundError();
  }

  /** if not owner of the order */
  if (order.userId !== req.user!.id) {
    throw new NotAuthorizedError();
  }

  order.set({ status: OrderStatus.Cancelled });
  await order.save();

  /**Publish a cancel event  */

  res.status(204).send({ message: 'orders deleted', order });
});

export { router as deleteOrderRouter };
