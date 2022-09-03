/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ExpirationCompleteEvent,
  OrderCancelledEvent,
  OrderStatus,
} from '@stark-innovations/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order, OrdersAttrs } from '../../../models/orders';
import { Ticket, TicketAttrs } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
  const expirationCompleteListener = new ExpirationCompleteListener(
    natsWrapper.client
  );
  /**Create a ticket */
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    price: 10,
    title: 'title',
    userId: new Types.ObjectId().toHexString(),
  });
  ticket.save();

  const order = new Order<OrdersAttrs>({
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  /**Create a fake data object */
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, order, ticket, data, expirationCompleteListener };
};

describe('Expiration complete listener', () => {
  it('update the order status to cancelled', async () => {
    const { expirationCompleteListener, data, msg, order } = await setup();
    await expirationCompleteListener.onMessage(data, msg);
    const cancelledOrder = await Order.findById(order.id);
    expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled);
  });

  it('Emits an order cancelled event', async () => {
    const { expirationCompleteListener, data, msg, order } = await setup();
    await expirationCompleteListener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData: OrderCancelledEvent['data'] = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(eventData.id).toEqual(order.id);
  });
});
