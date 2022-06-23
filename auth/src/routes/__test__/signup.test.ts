import supertest from 'supertest';
import { app } from '../../app';

it('return 201 on successful user sign up', async () => {
  return supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);
});

it('return 400 on invalid email', async () => {
  return supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test',
      password: 'password12',
    })
    .expect(400);
});

it('return 400 on invalid password', async () => {
  return supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: '12',
    })
    .expect(400);
});

it('return 400 on missing email and password', async () => {
  return supertest(app).post('/api/users/sign-up').send({}).expect(400);
});

it('disallows duplicate emails', async () => {
  await supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);

  await supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(400);
});

it('sets a cookie after successful sign up', async () => {
  const response = await supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
