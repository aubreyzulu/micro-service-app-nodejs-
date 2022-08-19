/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrderCancelledEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from '@stark-innovations/common';
import { Types } from 'mongoose';
import { Ticket, TicketAttrs } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  /** Create an instance of a Listener */
  const orderCancelledListener = new OrderCancelledListener(natsWrapper.client);

  /** Create orderId */
  const orderId = new Types.ObjectId().toHexString();

  /** Create and save a ticket */
  const ticket = new Ticket<TicketAttrs>({
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
    orderId,
  });

  /** Save the ticket to the database */
  await ticket.save();

  /** Create a fake data order object */
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    status: OrderStatus.Cancelled,
    userId: new Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  /**Create a fake message object */
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { orderCancelledListener, data, msg, ticket, orderId };
};

describe('Order Created Listener', () => {
  it('updates the ticket status to free (unreserved )', async () => {
    const { orderCancelledListener, data, msg, ticket } =
      await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCancelledListener.onMessage(data, msg);

    /** Expect that the ticket has been reserved */
    const reservedTicket = await Ticket.findById(ticket.id);
    expect(reservedTicket).toBeDefined();

    expect(reservedTicket!.orderId).toBeUndefined();
    expect(reservedTicket!.id).toEqual(ticket.id);
  });
  it('acks the message', async () => {
    const { orderCancelledListener, data, msg } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCancelledListener.onMessage(data, msg);
    /** Expect that ack is called */
    expect(msg.ack).toHaveBeenCalled();
  });
  it('publishes a ticket updated event', async () => {
    const { orderCancelledListener, data, msg, ticket } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCancelledListener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const parsedData: OrderCancelledEvent['data'] = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(parsedData).toBeDefined();
    expect(parsedData.id).toEqual(ticket.id);
  });
});
