import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { City, CityCreatePayload, CityUpdatePayload } from "~/types/governorate";

export function useCity() {
  const cityList = ref<City[]>([]);
  const selectedCity = ref<City | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const api = useApi();

  const fetchCitiesByGovernorate = async (governorateId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/cities`, {
        method: "GET",
        params: {
          governorate: governorateId,
        },
      });

      if (!response.success) {
        throw new Error("Failed to fetch cities");
      }

      cityList.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch cities";
      useToastTheme.error(err?.message || "Failed to fetch cities");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCityById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/cities/${id}`, {
        method: "GET",
      });

      if (!response.success) {
        throw new Error("City not found");
      }

      selectedCity.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch city";
      useToastTheme.error(err?.message || "Failed to fetch city");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCity = async (data: CityCreatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>("/cities", {
        method: "POST",
        body: data,
      });

      if (!response.success) {
        throw new Error("Failed to create city");
      }

      useToastTheme.success("City created successfully");
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to create city");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCity = async (id: string, data: CityUpdatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>(`/cities/${id}`, {
        method: "PUT",
        body: data,
      });

      if (!response.success) {
        throw new Error("Failed to update city");
      }

      useToastTheme.success("City updated successfully");
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to update city");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCity = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/cities/${id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error("Failed to delete city");
      }

      useToastTheme.success("City deleted successfully");
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete city");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    cityList,
    selectedCity,
    loading,
    error,
    fetchCitiesByGovernorate,
    getCityById,
    createCity,
    updateCity,
    deleteCity,
  };
}
