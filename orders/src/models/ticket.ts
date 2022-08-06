import { OrderStatus } from '@stark-innovations/common';
import { Schema, model, Document, Model } from 'mongoose';
import { Order } from './orders';

export interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}
export interface TicketDoc extends Document, TicketAttrs {
  isReserved(): Promise<boolean>;
}

const ticketSchema = new Schema<TicketAttrs, Model<TicketDoc>>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/** This method is used to check if a ticket is reserved or not. */
ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const reserved = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!reserved;
};

const Ticket = model<TicketAttrs, Model<TicketDoc>>('Ticket', ticketSchema);
export { Ticket };
