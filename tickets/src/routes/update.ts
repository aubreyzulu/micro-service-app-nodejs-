import express, { Request, Response } from 'express';
import {
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  requestValidator,
  BadRequestError,
} from '@stark-innovations/common';
import { Ticket } from '../models/ticket';
import { ticketValidations } from './new';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  ticketValidations,
  requestValidator,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }
    /**Error if user is not owner of the ticket being edited */
    if (ticket.userId !== req.user!.id) {
      throw new NotAuthorizedError();
    }
    /** Error if ticket has been reserved (means it has orderId) */
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }
    /**Update and save the ticket */
    ticket.set({ title, price });
    await ticket.save();

    /**Publish a ticket updated Event */
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(200).send({ message: 'Ticket updated', ticket });
  }
);

export { router as updateTicketRouter };
