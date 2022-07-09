import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
  const signup: () => Promise<string[]>;
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.signup = async (): Promise<string[]> => {
  const email = 'test@test.com';
  const password = 'password12';

  const response = await request(app)
    .post('/api/users/sign-up')
    .send({
      email,
      password,
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();

  const cookie = response.get('Set-Cookie');

  return cookie;
};
