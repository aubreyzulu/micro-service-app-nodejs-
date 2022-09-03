import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    console.log(data);
    try {
      const ticket = await Ticket.findById(data.ticket.id);

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      ticket.set({ orderId: undefined });
      await ticket.save();

      /** Publishes a ticket updated event */
      await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        version: ticket.version,
        price: ticket.price,
        userId: ticket.userId,
        orderId: ticket.orderId,
      });

      msg.ack();
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
