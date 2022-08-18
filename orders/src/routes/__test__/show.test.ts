import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

import { Ticket, TicketAttrs } from '../../models/ticket';

import { signin } from '../../test/setup';

it('gets the orders for the current user', async () => {
  const cookie = signin();
  const userId = new Types.ObjectId().toHexString();
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    userId,
    price: 20,
  });
  await ticket.save();
  const orderResponse = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(orderResponse.body.order.ticket.id).toEqual(ticket.id);

  const response = await request(app)
    .get(`/api/orders/${orderResponse.body.order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
  expect(response.body.order.id).toEqual(orderResponse.body.order.id);
});

it('return 401 if user tries to access another user order', async () => {
  const cookie = signin();
  const userId = new Types.ObjectId().toHexString();
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    userId,
    price: 20,
  });
  await ticket.save();
  const orderResponse = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(orderResponse.body.order.ticket.id).toEqual(ticket.id);

  await request(app)
    .get(`/api/orders/${orderResponse.body.order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401);
});
