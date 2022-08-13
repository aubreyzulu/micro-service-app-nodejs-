import { Types } from 'mongoose';

import { Ticket, TicketAttrs } from '../ticket';

it('Test for optimistic concurrency control', async () => {
  /**Create an instance of a Ticket */
  const ticket = new Ticket<TicketAttrs>({
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  });
  /**Save the ticket to the database */
  await ticket.save();

  /** Fetch the ticket from the database twice */
  const ticket1 = await Ticket.findById(ticket.id);

  const ticket2 = await Ticket.findById(ticket.id);

  /** Make Two separate changes to the tickets fetched */
  ticket1!.set({ price: 30 });
  ticket2!.set({ price: 40 });

  /** Save the tickets to the database */
  await ticket1!.save();
  try {
    await ticket2!.save();
  } catch (error) {
    return;
  }
  throw new Error('Should not reach this point');
});

it('Increments the version number on multiple saves', async () => {
  const ticket = new Ticket<TicketAttrs>({
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  ticket.set({ price: 30 });
  await ticket.save();
  expect(ticket.version).toEqual(1);
  ticket.set({ price: 40 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
