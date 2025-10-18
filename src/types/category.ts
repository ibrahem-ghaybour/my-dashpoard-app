import type { Pagination } from "@/types/pagination";

export interface CategoryCreatedBy {
  _id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: CategoryCreatedBy;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoryResponse {
  success: boolean;
  count: number;
  pagination: Pagination;
  data: Category[];
}
