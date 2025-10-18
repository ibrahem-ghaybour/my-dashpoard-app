export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "manager" | "customer";
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  createdAt: string;
}

export interface WishlistData {
  user: User;
  wishlistCount: number;
  items: WishlistItem[];
}

export interface WishlistResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: WishlistData[];
}
