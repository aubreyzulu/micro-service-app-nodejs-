import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  const signin: () => string[];
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

const signin = (): string[] => {
  const id = new mongoose.Types.ObjectId().toHexString();
  // Build a JSON payload {id, password}
  const payload = {
    id,
    email: 'test@test.com',
  };

  // Create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build Session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // stringify and parse to set the Session cookie
  const sessionJSON = JSON.stringify(session);

  // Take the string and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};

export { signin };
