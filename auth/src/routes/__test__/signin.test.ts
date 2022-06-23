import request from 'supertest';
import { app } from '../../app';

it('fails with email that does not exist', async () => {
  await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(400);
});

it('fails when incorrect password is supplied when signing in', async () => {
  await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);

  await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password13',
    })
    .expect(400);
});

it('return 200 on successful user sign up', async () => {
  await request(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/sign-in')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
