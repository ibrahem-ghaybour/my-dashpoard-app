import type { OrderData, OrderResponse, User } from "@/types/orders";
import { useInitialise } from "~/composable/useInitialise";
import { buildQueryPayload } from "~/utils/build";
import { useToastTheme } from "~/composable/useToastTheme";
import { ref } from "vue";
import { useApi } from "~/plugins/api";
export interface UserO extends User {
  status: string;
  amount: number;
  orderCode: string;
  createdAt: string;
  // updatedAt: string;t
}
export function useOrders() {
  const orderList = ref<OrderData[]>([]);
  const selectedOrder = ref<OrderData | null>(null);
  const users = ref<UserO[]>([]);
  const error = ref<string | null>(null);

  const { pagination, filterOptions, loading, search } = useInitialise();

  const  api  = useApi();
  const usersOrders = (response: OrderResponse) => {
    users.value = response.data.map((order) => {
      return {
        ...order.user,
        status: order.status || 'pending',
        amount: order.totalAmount,
        orderCode: order.orderCode || '',
        createdAt: order.createdAt,
        orderId: order._id,
      } as UserO;
    });
  };
  const fetchData = async () => {
    loading.value = true;

    try {
      const response = await api<OrderResponse>("/orders", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          q: search.value,
          ...buildQueryPayload(filterOptions.value),
        },
      });
      orderList.value = response.data;
      // Only update pagination if response.Pagination exists
      if (response.pagination) {
        pagination.value = response.pagination;
      }
      usersOrders(response);
      if (!response.success) {
        throw new Error('Failed to fetch orders');
      }
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to fetch orders');
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const fetchById = async (id: string) => {
    loading.value = true;

    try {
      // Single order fetch. Some backends may return { data: OrderData } or { data: OrderData[] }
      const response = await api<any>(`/orders/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedOrder.value = Array.isArray(data)
        ? data[0] ?? null
        : data ?? null;
      if (!selectedOrder.value) {
        error.value = "Order not found";
      }
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to fetch order');
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const deleteOrders = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<OrderResponse>("/orders/bulk", {
        method: "DELETE",
        body: { orderIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete orders");
      }
      await fetchData();
      useToastTheme.success("Orders deleted successfully");
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to delete orders');
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const updateBulk = async (ids: string[], status: string) => {
    loading.value = true;

    try {
      const response = await api<OrderResponse>("/orders/status/bulk", {
        method: "PATCH",
        body: { orderIds: ids, status },
      });
      if (!response.success) {
        throw new Error("Failed to update orders");
      }
      useToastTheme.success("Orders updated successfully");
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to update orders');
      throw err;
    } finally {
      loading.value = false;
    }
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
  const firstPage = () => {
    pagination.value.page = 1;
    fetchData();
  };
  const lastPage = () => {
    pagination.value.page = pagination.value.pages;
    fetchData();
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.value.pages) {
      pagination.value.page = page;
      fetchData();
    }
  };
  const limitSize = (limit: number) => {
    pagination.value.limit = limit;
    fetchData();
  };
  
  const createOrder = async (orderData: any) => {
    loading.value = true;

    try {
      const response = await api<any>("/orders", {
        method: "POST",
        body: orderData,
      });
      if (!response.success) {
        throw new Error("Failed to create order");
      }
      useToastTheme.success("Order created successfully");
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to create order');
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchUserOrders = async (userId: string) => {
    loading.value = true;

    try {
      const response = await api<OrderResponse>("/orders", {
        method: "GET",
        params: {
          userId: userId,
          page: 1,
          limit: 100,
        },
      });
      if (!response.success) {
        throw new Error("Failed to fetch user orders");
      }
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || 'Failed to fetch user orders');
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    orderList,
    selectedOrder,
    loading,
    error,
    pagination,
    users,
    search,
    filterOptions,
    fetchData,
    fetchById,
    updateBulk,
    deleteOrders,
    createOrder,
    fetchUserOrders,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    goToPage,
    limitSize,
  };
}
