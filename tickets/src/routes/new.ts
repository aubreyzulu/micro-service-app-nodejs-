import { requireAuth, requestValidator } from '@stark-innovations/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { Ticket, TicketAttrs } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// Validation middleware
const ticketValidations = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('price')
    .trim()
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
];

router.post(
  '/api/tickets',
  requireAuth,
  ticketValidations,
  requestValidator,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = new Ticket<TicketAttrs>({
      title,
      price,
      userId: req.user!.id,
    });

    await ticket.save();
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(201).send({ message: 'Ticket created', ticket });
  }
);

export { router as createTicketRouter, ticketValidations };
