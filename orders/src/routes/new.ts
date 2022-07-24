import {
  BadRequestError,
  NotFoundError,
  requestValidator,
  requireAuth,
} from '@stark-innovations/common';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Orders } from '../models/orders';

const router = express.Router();

const orderValidations = [
  body('ticketId')
    .notEmpty()
    .withMessage('Ticket ID is required')
    .custom((input) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket ID is invalid'),
];
router.post(
  '/api/orders',
  requireAuth,
  orderValidations,
  requestValidator,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    /**
     * Find the ticket the user is trying to order in the database
     */
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    /**
     * Make sure the ticket is not already reserved
     */

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    /**
     * Calculate expiration date for the order
     */

    res.status(200).send({ message: 'orders created' });
  }
);

export { router as createOrderRouter };
