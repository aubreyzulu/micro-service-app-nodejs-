import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();
console.log('string', randomBytes(4).toString('hex'));
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');
  const data = {
    id: '123',
    title: 'concert',
    price: 20,
  };
  try {
    const publisher = new TicketCreatedPublisher(stan);
    await publisher.publish(data);
  } catch (err) {
    console.error(err);
  }
});
