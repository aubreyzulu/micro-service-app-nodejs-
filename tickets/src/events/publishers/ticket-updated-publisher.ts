import {
  Publisher,
  TicketUpdatedEvent,
  Subjects,
} from '@stark-innovations/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = 'payments-service';

  // async publish(data: TicketCreatedEvent['data']) {
  //   await this.client.publish(this.subject, JSON.stringify(data));
  // }
}
