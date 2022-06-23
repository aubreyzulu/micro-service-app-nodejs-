import supertest from 'supertest';
import { app } from '../../app';

it('return 200 on successful user sign out', async () => {
  await supertest(app)
    .post('/api/users/sign-up')
    .send({
      email: 'test@test.com',
      password: 'password12',
    })
    .expect(201);

  const response = await supertest(app)
    .post('/api/users/sign-out')
    .send({})
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
