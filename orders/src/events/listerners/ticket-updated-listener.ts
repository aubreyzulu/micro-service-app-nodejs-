import {
  Listener,
  TicketUpdatedEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class TicketUpdatedLister extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price, userId, version } = data;
    const ticket = await Ticket.findOne({ _id: id, version: version - 1 });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ title, price, userId });
    await ticket.save();

    /** Acknowledge receiving ticket updated event */
    msg.ack();
  }
}
