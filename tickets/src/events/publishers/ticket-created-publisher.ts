import {
  Publisher,
  TicketCreatedEvent,
  Subjects,
} from '@stark-innovations/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  // async publish(data: TicketCreatedEvent['data']) {
  //   await this.client.publish(this.subject, JSON.stringify(data));
  // }
}


