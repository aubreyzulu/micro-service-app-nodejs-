import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@stark-innovations/common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    /**Delay to process the job (time for the order to expire) */
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('waiting time', delay);
    /**Add job to queue */
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      { delay: 10000 }
    );

    /**Acknowledges receiving the event and job added to queue */
    msg.ack();
  }
}
