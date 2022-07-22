import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from './subjects';
import { TicketUpdatedEvent } from './ticket-created-event';

export class TicketCreatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = 'payment-service';
  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log('Event received:', data);
    msg.ack();
  }
}
