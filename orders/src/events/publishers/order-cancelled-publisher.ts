import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@stark-innovations/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
