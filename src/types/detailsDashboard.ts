export interface Range {
  start: string; // ISO date string
  end: string; // ISO date string
}

export interface OverviewItem {
  date: string; // e.g. "2025-08-21"
  revenue: number;
  orders: number;
}

export interface SaleUser {
  _id: string;
  name: string;
  email: string;
}

export interface RecentSale {
  _id: string;
  user: SaleUser;
  totalAmount: number;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "completed" | "failed";
  createdAt: string; // ISO date string
}

export interface DashboardData {
  totalRevenue: number;
  subscriptions: number;
  sales: number;
  activeNow: number;
  overview: OverviewItem[];
  recentSales: RecentSale[];
}
export interface CurrentStats {
  totalRevenue: number;
  subscriptions: number;
  sales: number;
  activeNow: number;
}
export interface PreviousStats extends CurrentStats {}

export interface DashboardResponse {
  success: boolean;
  range: Range;
  data: DashboardData;
  currentStats: CurrentStats;
  previousStats: PreviousStats;
}
