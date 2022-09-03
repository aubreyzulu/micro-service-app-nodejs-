import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/orders';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    try {
      const order = await Order.findById(data.orderId).populate('ticket');
      if (!order) {
        throw new Error('order not found');
      }
      if (order.status === OrderStatus.Complete) {
        return msg.ack();
      }
      order.set({
        status: OrderStatus.Cancelled,
      });

      await order.save();
      console.log(order, 'checking');
      await new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        status: order.status,
        version: order.version,
        expiresAt: order.expiresAt,
        userId: order.userId,
        ticket: {
          id: order.ticket.id,
          price: order.ticket.price,
        },
      });
      msg.ack();
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
