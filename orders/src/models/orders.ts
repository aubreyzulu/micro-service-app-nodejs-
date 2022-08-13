import { OrderStatus } from '@stark-innovations/common';
import { Model, model, Schema } from 'mongoose';
import { TicketDoc } from './ticket';

const { Types } = Schema;

export interface OrdersAttrs {
  userId: string;
  status: OrderStatus;
  ticket: TicketDoc;
  expiresAt: Date;
}

export interface OrdersDoc extends Document, OrdersAttrs {
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ordersSchema = new Schema<OrdersAttrs, Model<OrdersDoc>>(
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
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const Order = model<OrdersAttrs, Model<OrdersDoc>>('Orders', ordersSchema);

export { Order };
