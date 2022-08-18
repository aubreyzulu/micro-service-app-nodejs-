import { OrderStatus } from '@stark-innovations/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrdersAttrs } from '../../models/orders';
import { Ticket, TicketAttrs } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

import { signin } from '../../test/setup';

// describe('POST /orders', () => {
it('return an error when no ticketId is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: '' })
    .expect(400);
});

it('return an error when an invalid ticketId is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: 'invalid' })
    .expect(400);
});

it('return an error when no user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send({ ticketId: 'invalid' })
    .expect(401);
});

it('it return  an error when the ticket  is not found', async () => {
  const cookie = signin();
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: new Types.ObjectId().toHexString() })
    .expect(404);
});

it('it return  an error when the ticket  is already reserved', async () => {
  const cookie = signin();
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    userId: new Types.ObjectId().toHexString(),
    price: 20,
  });
  await ticket.save();
  const order = new Order<OrdersAttrs>({
    ticket,
    userId: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserve a ticket', async () => {
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    userId: new Types.ObjectId().toHexString(),
    price: 20,
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(201);
  expect(response.body.order.ticket.id).toEqual(ticket.id);
});

it('publishes order:created  event', async () => {
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    userId: new Types.ObjectId().toHexString(),
    price: 20,
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

// });
