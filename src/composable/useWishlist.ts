import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { WishlistData, WishlistResponse } from "~/types/wishlist";

export function useWishlist() {
  const wishlistList = ref<WishlistData[]>([]);
  const selectedWishlist = ref<WishlistData | null>(null);
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
      const response = await api<WishlistResponse>("/wishlist/all", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
        },
      });

      if (!response.success) {
        error.value = "Failed to fetch wishlists";
        throw new Error("Failed to fetch wishlists");
      }

      wishlistList.value = response.data;
      pagination.value = {
        page: response.page,
        limit: pagination.value.limit,
        total: response.total,
        pages: response.totalPages,
        hasNext: response.page < response.totalPages,
        hasPrev: response.page > 1,
      };
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to fetch wishlist");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getWishlistByUserId = async (userId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/wishlist/${userId}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedWishlist.value = data ?? null;
      if (!selectedWishlist.value) {
        error.value = "Wishlist not found";
      }
      return selectedWishlist.value;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to fetch wishlist");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteWishlistItem = async (userId: string, itemId: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/wishlist/${userId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete wishlist item");
      }
      useToastTheme.success("Item removed from wishlist");
      // Refresh the wishlist
      await getWishlistByUserId(userId);
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete item");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearWishlist = async (userId: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/wishlist/${userId}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to clear wishlist");
      }
      await fetchData();
      useToastTheme.success("Wishlist cleared");
      await fetchData();
    } catch (err: any) {
      useToastTheme.error((err as any)?.message || "Failed to clear wishlist");
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
    wishlistList,
    selectedWishlist,
    loading,
    error,
    pagination,
    fetchData,
    getWishlistByUserId,
    deleteWishlistItem,
    clearWishlist,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
