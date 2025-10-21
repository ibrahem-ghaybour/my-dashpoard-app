export interface Currency {
  _id: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CurrencyListResponse {
  success: boolean;
  data: Currency[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CurrencyCreatePayload {
  currency: string;
}

export interface CurrencyUpdatePayload {
  currency?: string;
  isActive?: boolean;
}
