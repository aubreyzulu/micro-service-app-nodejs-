import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    expiresAt: string | Date;
    ticket: {
      id: string;
      price: number;
    };
  };
}
