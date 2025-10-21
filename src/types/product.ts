
import type { Pagination } from "@/types/pagination";
export interface Product {
  _id: string;
  name: string;
  description: string;
  image?: string; // deprecated, use images array
  images: string[];
  primaryImage: string;
  price: number;
  category: {
    _id: string;
    name: string;
    description: string;
  };
  stock: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface ProductResponse {
  data: Product[];
  pagination: Pagination;
}
