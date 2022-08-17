import mongoose from 'mongoose';
import { app } from './app';
import { TicketCreatedListener } from './events/listerners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listerners/ticket-updated-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });

    /**
     * Close the connection to NATS
     * on process signal interrupt
     */
    process.on('SIGINT', () => natsWrapper.client.close());

    /**
     * Close the connection to NATS
     * on process signal terminate
     */
    process.on('SIGTERM', () => natsWrapper.client.close());
    await mongoose.connect(process.env.MONGO_URL);

    console.log('Connected to MongoDB');
    /** Listen for events */
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log('Error connecting to MongoDB', error);
  }
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

start();
