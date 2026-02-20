/**
 * Buyer flow types – scaffold for Backend API.
 * Khi BE có contract, đối chiếu và điều chỉnh.
 */

import type { Listing } from "./shopbike";

export type OrderStatus =
  | "PENDING"
  | "RESERVED"
  | "IN_TRANSACTION"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "CARD" | "MOMO" | "BANK_TRANSFER";

export type Order = {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId?: string;
  status: OrderStatus;
  totalPrice: number;
  depositAmount?: number;
  depositPaid?: boolean;
  paymentMethod?: PaymentMethod;
  shippingAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  expiresAt?: string; // ISO date
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOrderRequest = {
  listingId: string;
  plan: "DEPOSIT" | "FULL";
  shippingAddress: {
    street: string;
    city: string;
    postalCode?: string;
  };
};

export type InitiatePaymentRequest = {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  cardDetails?: { number: string; name: string; exp: string; cvc: string };
};

export type Transaction = Order & {
  orderId: string;
  depositPaid?: number;
};
