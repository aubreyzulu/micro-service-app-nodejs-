import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from '@stark-innovations/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
