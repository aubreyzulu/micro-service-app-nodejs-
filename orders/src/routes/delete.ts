import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@stark-innovations/common';
import express from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('ticket');

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
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    userId: order.userId,
    version: order.version,
    expiresAt: order.expiresAt.toISOString(),
    status: order.status,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
    },
  });

  res.status(204).send({ message: 'orders deleted', order });
});

export { router as deleteOrderRouter };
