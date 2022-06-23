import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current logged-in user', async () => {
  const cookie = await signup();

  const response = await request(app)
    .get('/api/users/current-user')
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.user.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/current-user')
    .expect(200);

  expect(response.body.user).toEqual(null);
});
