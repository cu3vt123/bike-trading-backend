/**
 * Custom error với status – theo shoppingCartBE ErrorwithStatus
 */
export class ErrorWithStatus extends Error {
  constructor({ message, status = 500 }) {
    super(message);
    this.status = status;
    this.name = "ErrorWithStatus";
  }
}
