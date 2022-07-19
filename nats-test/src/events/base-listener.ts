import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  /**
   * Name of the channel to listen to
   */
  abstract subject: T['subject'];
  /**
   * Queue group name for the subscription
   */
  abstract queueGroupName: string;
  /**
   *
   * @param data - data received from the message
   * @param msg
   */
  abstract onMessage(data: T['data'], msg: Message): void;
  /**
   * Stan Client
   */
  private client: Stan;
  /**
   * Timeout for the ack wait
   */
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }
  /**
   * Start listening for messages/subscriptions
   * @returns void
   */
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }
  /**
   * Parse the message data
   * @param msg - message received from the NATS
   * @returns void
   */
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8'));
  }
}
