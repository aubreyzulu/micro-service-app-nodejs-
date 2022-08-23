import Queue from 'bull';

interface Payload {
  orderId: string;
}

/** Create job queue for order expiration */
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(' i want to publish a job', job.data.orderId);
});

export { expirationQueue };
