import { OrderStatus } from '@stark-innovations/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/orders';
import { Ticket, TicketAttrs } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

import { signin } from '../../test/setup';

it(`return 401 if user tries to cancel an order that doesn't belong to him/her`, async () => {
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
    .delete(`/api/orders/${orderResponse.body.order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

it('cancels an order', async () => {
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

  await request(app)
    .delete(`/api/orders/${response.body.order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(response.body.order.id);
  expect(cancelledOrder?.status).toBe(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
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

  await request(app)
    .delete(`/api/orders/${response.body.order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(response.body.order.id);
  expect(cancelledOrder?.status).toBe(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
