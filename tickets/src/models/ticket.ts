import mongoose from 'mongoose';

export interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

const ticketSchema = new mongoose.Schema<TicketAttrs>(
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

const Ticket = mongoose.model<TicketAttrs>('Ticket', ticketSchema);
export { Ticket };
