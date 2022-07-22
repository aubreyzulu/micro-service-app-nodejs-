import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { signin } from '../../test/setup';

it('has a route handler listening to /api/tickets', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});
it('return a status other than 401 if the user is signed in', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('can only be accessed if user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).toEqual(401);
});

it('return invalid error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
});

it('return invalid error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Title',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Title',
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  const ticket = {
    title: 'Title',
    price: 20,
  };

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send(ticket)
    .expect(201);
  expect(response.body.ticket.title).toEqual(ticket.title);
});

it('publishes an event', async () => {
  const ticket = {
    title: 'Title',
    price: 20,
  };

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send(ticket)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
