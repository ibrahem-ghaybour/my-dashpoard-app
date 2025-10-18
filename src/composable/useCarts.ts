import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { CartData, CartResponse } from "~/types/cart";

export function useCarts() {
  const cartList = ref<CartData[]>([]);
  const selectedCart = ref<CartData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const api = useApi();

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<CartResponse>("/cart/all", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
        },
      });

      if (!response.success) {
        error.value = "Failed to fetch carts";
        throw new Error("Failed to fetch carts");
      }

      cartList.value = response.data;
      pagination.value = {
        page: response.page,
        limit: pagination.value.limit,
        total: response.total,
        pages: response.totalPages,
        hasNext: response.page < response.totalPages,
        hasPrev: response.page > 1,
      };
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCartById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/carts/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedCart.value = Array.isArray(data) ? data[0] ?? null : data ?? null;
      if (!selectedCart.value) {
        error.value = "Cart not found";
      }
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCart = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/carts/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete cart");
      }
      await fetchData();
      useToastTheme.success("Cart deleted successfully");
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCarts = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<CartResponse>("/carts/bulk", {
        method: "DELETE",
        body: { cartIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete carts");
      }
      await fetchData();
      useToastTheme.success("Carts deleted successfully");
    } catch (err) {
      useToastTheme.error(err);
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
    if (pagination.value.hasNext) {
      pagination.value.page++;
      fetchData();
    }
  };

  const prevPage = () => {
    if (pagination.value.hasPrev) {
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
    cartList,
    selectedCart,
    loading,
    error,
    pagination,
    fetchData,
    getCartById,
    deleteCart,
    deleteCarts,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
