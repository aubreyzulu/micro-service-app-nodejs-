import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    try {
      /** Find the ticket that the order is reserving */
      const ticket = await Ticket.findById(data.ticket.id);

      /** If no ticket, throw an error */
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      /** Mark the ticket as being reserved by the order */
      await ticket.set({ orderId: data.id }).save();

      /** ack the message */
      msg.ack();
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
