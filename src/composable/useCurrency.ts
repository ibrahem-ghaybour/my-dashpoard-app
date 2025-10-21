import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { Currency, CurrencyListResponse, CurrencyCreatePayload, CurrencyUpdatePayload } from "~/types/currency";

export function useCurrency() {
  const currencyList = ref<Currency[]>([]);
  const selectedCurrency = ref<Currency | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);


  const api = useApi();

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<CurrencyListResponse>("/settings", {
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to fetch currencies");
      }

      currencyList.value = response.data;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch currencies";
      useToastTheme.error(err?.message || "Failed to fetch currencies");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCurrencyById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/settings/currency/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedCurrency.value = data ?? null;
      if (!selectedCurrency.value) {
        error.value = "Currency not found";
      }
      return selectedCurrency.value;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch currency";
      useToastTheme.error(err?.message || "Failed to fetch currency");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCurrency = async (currencyData: CurrencyCreatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>("/settings/currency", {
        method: "PUT",
        body: currencyData,
      });
      if (!response.success) {
        throw new Error("Failed to create currency");
      }
      useToastTheme.success("Currency created successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to create currency");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrency = async (id: string, currencyData: CurrencyUpdatePayload) => {
    loading.value = true;

    try {
      const response = await api<any>(`settings/currency`, {
        method: "GET",
      });
      if (!response.success) {
        throw new Error("Failed to update currency");
      }
      useToastTheme.success("Currency updated successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to update currency");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCurrency = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/settings/currency/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete currency");
      }
      useToastTheme.success("Currency deleted successfully");
      await fetchData();
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete currency");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCurrencies = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<CurrencyListResponse>("/settings/currency/bulk", {
        method: "DELETE",
        body: { currencyIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete currencies");
      }
      await fetchData();
      useToastTheme.success("Currencies deleted successfully");
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete currencies");
      throw err;
    } finally {
      loading.value = false;
    }
  };


  return {
    currencyList,
    selectedCurrency,
    loading,
    error,
    fetchData,
    getCurrencyById,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    deleteCurrencies,
  };
}
