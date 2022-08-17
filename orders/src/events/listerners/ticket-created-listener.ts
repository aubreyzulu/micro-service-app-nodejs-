import {
  Listener,
  TicketCreatedEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { Ticket, TicketAttrs } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price, userId } = data;
    const ticket = new Ticket<TicketAttrs>({ _id: id, title, price, userId });
    await ticket.save();

    msg.ack();
  }
}
