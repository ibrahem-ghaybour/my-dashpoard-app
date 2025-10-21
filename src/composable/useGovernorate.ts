import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type {
  Governorate,
  GovernorateListResponse,
  GovernorateDetailResponse,
  GovernorateCreatePayload,
  GovernorateUpdatePayload,
  City,
} from "~/types/governorate";

export function useGovernorate() {
  const governorateList = ref<Governorate[]>([]);
  const selectedGovernorate = ref<Governorate | null>(null);
  const cities = ref<City[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const api = useApi();

  const fetchData = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<GovernorateListResponse>("/governorates", {
        method: "GET",
        params: {
          page: params?.page || pagination.value.page,
          limit: params?.limit || pagination.value.limit,
          search: params?.search,
          status: params?.status,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });

      if (!response.success) {
        throw new Error("Failed to fetch governorates");
      }

      governorateList.value = response.data;
      pagination.value = {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.total,
        totalPages: response.pagination.totalPages,
      };
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch governorates";
      useToastTheme.error(err?.message || "Failed to fetch governorates");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getGovernorateById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<GovernorateDetailResponse>(`/governorates/${id}`, {
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Governorate not found");
      }

      selectedGovernorate.value = response.data.governorate;
      cities.value = response.data.cities;
      return response.data;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch governorate";
      useToastTheme.error(err?.message || "Failed to fetch governorate");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createGovernorate = async (data: GovernorateCreatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>("/governorates", {
        method: "POST",
        body: data,
      });

      if (!response.success) {
        throw new Error("Failed to create governorate");
      }

      useToastTheme.success("Governorate created successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to create governorate");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateGovernorate = async (id: string, data: GovernorateUpdatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>(`/governorates/${id}`, {
        method: "PUT",
        body: data,
      });

      if (!response.success) {
        throw new Error("Failed to update governorate");
      }

      useToastTheme.success("Governorate updated successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to update governorate");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteGovernorate = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/governorates/${id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error("Failed to delete governorate");
      }

      useToastTheme.success("Governorate deleted successfully");
      await fetchData();
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete governorate");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const goToPage = (page: number) => {
    pagination.value.page = page;
    fetchData();
  };

  const nextPage = () => {
    if (pagination.value.page < pagination.value.totalPages) {
      pagination.value.page++;
      fetchData();
    }
  };

  const prevPage = () => {
    if (pagination.value.page > 1) {
      pagination.value.page--;
      fetchData();
    }
  };

  const limitSize = (limit: number) => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchData();
  };

  return {
    governorateList,
    selectedGovernorate,
    cities,
    loading,
    error,
    pagination,
    fetchData,
    getGovernorateById,
    createGovernorate,
    updateGovernorate,
    deleteGovernorate,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
