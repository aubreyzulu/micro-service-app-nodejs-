import mongoose, { Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
  orderId?: string;
}
export interface TicketDoc extends Document, TicketAttrs {
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new mongoose.Schema<TicketAttrs, Model<TicketDoc>>(
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
    orderId: {
      type: String,
      required: false,
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
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
const Ticket = mongoose.model<TicketAttrs, Model<TicketDoc>>(
  'Ticket',
  ticketSchema
);
export { Ticket };
