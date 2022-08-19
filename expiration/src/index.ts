import { natsWrapper } from './nats-wrapper';

const start = async () => {
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
  } catch (error) {
    console.log('Error connecting to MongoDB', error);
  }
};

start();
