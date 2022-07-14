import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';

const createTicket = async () => {
  const cookie = signin();
  return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(201);
};

describe('GET /api/tickets', () => {
  it('should return all tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app)
      .get('/api/tickets')
      .send({})
      .expect(200);

    expect(response.body.tickets.length).toEqual(3);
  });
});
