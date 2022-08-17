/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TicketUpdatedEvent } from '@stark-innovations/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket, TicketAttrs } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  /** Create an instance of a listener */
  const ticketUpdatedListener = new TicketUpdatedListener(natsWrapper.client);

  /** Create and save a ticket */
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  });
  await ticket.save();

  /** Create a fake data object */
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new title',
    price: 200,
    userId: ticket.userId,
  };

  /** Create a fake message object*/
  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, msg, ticketUpdatedListener, ticket };
};

describe('Ticket Updated Listener', () => {
  it('updates and saves a ticket', async () => {
    const { data, msg, ticketUpdatedListener, ticket } = await setup();
    /**Updates the ticket */
    await ticketUpdatedListener.onMessage(data, msg);

    /** Fetches the updates ticket */
    const updatedTicket = await Ticket.findById(ticket.id);

    /**Assets the results */
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });
  it('acks the message', async () => {
    const { data, msg, ticketUpdatedListener } = await setup();

    await ticketUpdatedListener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('does not call ack if the event has a skipped version number', async () => {
    const { data, msg, ticketUpdatedListener } = await setup();

    data.version = 10;
    try {
      await ticketUpdatedListener.onMessage(data, msg);
      // eslint-disable-next-line no-empty
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
