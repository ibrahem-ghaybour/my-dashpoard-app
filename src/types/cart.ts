export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "manager";
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartData {
  _id: string;
  user: User;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CartResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: CartData[];
}
