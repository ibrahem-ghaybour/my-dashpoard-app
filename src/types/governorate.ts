export interface City {
  _id: string;
  name: string;
  nameAr: string;
  governorate: string;
  code?: string;
  status: "active" | "inactive" | "maintenance";
  description?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Governorate {
  _id: string;
  name: string;
  nameAr: string;
  code: string;
  status: "active" | "inactive" | "maintenance";
  description?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GovernorateWithCities extends Governorate {
  cities?: City[];
}

export interface GovernorateListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Governorate[];
}

export interface GovernorateDetailResponse {
  success: boolean;
  data: {
    governorate: Governorate;
    cities: City[];
  };
}

export interface GovernorateCreatePayload {
  name: string;
  nameAr: string;
  code: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
}

export interface GovernorateUpdatePayload {
  name?: string;
  nameAr?: string;
  code?: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
}

export interface CityCreatePayload {
  name: string;
  nameAr: string;
  governorate: string;
  code?: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
}

export interface CityUpdatePayload {
  name?: string;
  nameAr?: string;
  code?: string;
  status?: "active" | "inactive" | "maintenance";
  description?: string;
}
