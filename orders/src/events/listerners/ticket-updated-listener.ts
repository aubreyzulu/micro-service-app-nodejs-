import {
  Listener,
  TicketUpdatedEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price, userId } = data;
    console.log(data.version - 1, 'ticket');
    try {
      const all = await Ticket.find({});
      console.log(all, 'everything');
      const ticket = await Ticket.findByEvent(data);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      ticket.set({ title, price, userId });
      await ticket.save();
      /** Acknowledge receiving ticket updated event */
      msg.ack();
    } catch (err: any) {
      console.error(err.message);
    }
  }
}
