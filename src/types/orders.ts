export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  governorate: string;
  postalCode: string;
  country: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "manager";
}

export interface Product {
  _id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
export interface OrderData {
  _id: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  isActive: boolean;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  orderCode?: string;
  __v?: number;
}
import type { Pagination } from "@/types/pagination";
export interface OrderResponse {
  pagination: Pagination;
  success: boolean;
  data: OrderData[];
}
