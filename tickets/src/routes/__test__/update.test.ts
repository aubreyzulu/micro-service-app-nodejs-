import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
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

it('return a 404 if the provided id does not exist', async () => {
  const cookie = signin();
  await createTicket();

  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(404);
});

it('return a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(401);
});

it('return a 401 if user does not own the ticket', async () => {
  const cookie = signin();
  const ticket = await createTicket();

  await request(app)
    .put(`/api/tickets/${ticket.body.ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(401);
});

it('return a 400 if the user provides an invalid title or price', async () => {
  const cookie = signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: -20,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(201);

  const response = await request(app)
    .put(`/api/tickets/${ticket.body.ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200);
  expect(response.body.ticket.title).toEqual('New Title');
  expect(response.body.ticket.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = signin();

  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(201);

  const reserveTicket = await Ticket.findById(ticket.body.ticket.id);
  reserveTicket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await reserveTicket!.save();

  await request(app)
    .put(`/api/tickets/${ticket.body.ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(400);
});
