import { OrderStatus } from '@stark-innovations/common';
import { model, Schema } from 'mongoose';
import { TicketDoc } from './ticket';

const { Types } = Schema;

export interface OrdersAttrs {
  userId: string;
  status: OrderStatus;
  ticket: TicketDoc;
  expiresAt: Date;
}

export interface OrdersDoc extends Document, OrdersAttrs {}

const ordersSchema = new Schema<OrdersAttrs>(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Types.Date,
    },
    ticket: {
      type: Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const Orders = model<OrdersAttrs>('Orders', ordersSchema);

export { Orders };
