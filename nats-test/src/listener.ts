import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './events/ticket-created-listener';
console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

/**
 * Close the connection to NATS
 * on process signal interrupt
 */
process.on('SIGINT', () => stan.close());

/**
 * Close the connection to NATS
 * on process signal terminate
 */
process.on('SIGTERM', () => stan.close());
