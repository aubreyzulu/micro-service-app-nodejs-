/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@stark-innovations/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  /** Create an instance of a Listener */
  const ticketListener = new TicketCreatedListener(natsWrapper.client);
  /** Create a fake data object */
  const data: TicketCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    version: 0,
    price: 200,
    title: 'ticket',
  };

  /**Create a fake message object */
  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, msg, ticketListener };
};

describe('Ticket Created Listener', () => {
  it('creates and saves a ticket', async () => {
    const { data, msg, ticketListener } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await ticketListener.onMessage(data, msg);
    /** Expect that a ticket is created */
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it('acks the message', async () => {
    const { data, msg, ticketListener } = await setup();
    /** Call the onMessage function with the data object and the message object */
    await ticketListener.onMessage(data, msg);
    /** Expect that ack is called */
    expect(msg.ack).toHaveBeenCalled();
  });
});
