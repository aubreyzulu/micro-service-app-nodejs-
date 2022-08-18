import { OrderStatus } from '@stark-innovations/common';
import { Schema, model, Document, Model } from 'mongoose';
import { Order } from './orders';

export interface TicketAttrs {
  _id: string;
  title: string;
  price: number;
  userId: string;
}
export interface TicketDoc extends TicketAttrs, Omit<Document<string>, '_id'> {
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isReserved(): Promise<boolean>;
}
interface TicketModel extends Model<TicketDoc> {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
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
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

ticketSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

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

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
