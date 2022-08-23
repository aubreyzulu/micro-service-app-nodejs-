/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OrderStatus, TicketUpdatedEvent } from '@stark-innovations/common';
import { Types } from 'mongoose';
import { Ticket, TicketAttrs } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  /** Create an instance of a Listener */
  const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);

  /** Create and save a ticket */
  const ticket = new Ticket<TicketAttrs>({
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  });

  /** Save the ticket to the database */
  await ticket.save();

  /** Create a fake data order object */
  const data = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
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

  return { orderCreatedListener, data, msg, ticket };
};

describe('Order Created Listener', () => {
  it('Sets the orderId on a ticket marking it  as reserved', async () => {
    const { orderCreatedListener, data, msg, ticket } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCreatedListener.onMessage(data, msg);

    /** Expect that the ticket has been reserved */
    const reservedTicket = await Ticket.findById(ticket.id);
    expect(reservedTicket).toBeDefined();

    expect(reservedTicket!.orderId).toEqual(data.id);
    expect(reservedTicket!.id).toEqual(ticket.id);
  });

  it('acks the message', async () => {
    const { orderCreatedListener, data, msg } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCreatedListener.onMessage(data, msg);
    /** Expect that ack is called */
    expect(msg.ack).toHaveBeenCalled();
  });
  it('Publishes a ticket updated event', async () => {
    const { orderCreatedListener, data, msg, ticket } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await orderCreatedListener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const parsedData: TicketUpdatedEvent['data'] = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(parsedData).toBeDefined();
    expect(parsedData.id).toEqual(ticket.id);
    expect(parsedData.orderId).toEqual(data.id);
  });
});
