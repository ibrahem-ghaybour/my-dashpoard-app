export interface Auth {
  status:"active" | "inactive" | "pending",
  isActive:boolean
  avatar: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
export interface LoginResponse {
  user: Auth;
  token: string;
}

export interface User extends Auth {
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface UserListResponse {
  count: number;
  success: boolean;
  data: User[];
  pagination: Pagination;
}
