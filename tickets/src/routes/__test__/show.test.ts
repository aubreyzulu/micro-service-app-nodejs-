import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';

it('return 404 if route not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it('return a ticket if the ticket is found', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    });

  expect(response.body.ticket.title).toEqual('Title');
  expect(response.body.ticket.price).toEqual(20);

  const res = await request(app)
    .get(`/api/tickets/${response.body.ticket.id}`)
    // .set('Cookie', cookie)
    .send({})
    .expect(200);

  expect(res.body.ticket.title).toEqual('Title');
  expect(res.body.ticket.price).toEqual(20);
});
