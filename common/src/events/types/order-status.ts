export enum OrderStatus {
  /**
   * The order has been created,
   *  but the user has not yet reserved the tickets.
   */
  Created = 'created',
  /**
   * The user is trying to reserve a ticket that has already been reserved,
   * or the user has cancelled the order.
   * The order expires before payment is made.
   */
  Cancelled = 'cancelled',

  /**
   *  The user has successfully reserved the ticket.
   */
  AwaitingPayment = 'awaiting:payment',
  /**
   * The order has been paid successfully.
   *
   */
  Complete = 'complete',
}
