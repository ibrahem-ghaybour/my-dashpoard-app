import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { OrderResponse } from "~/types/orders";

export interface ProductFromOrder {
  _id: string;
  name: string;
  price: number;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  currency: string;
  lastOrderDate: string;
}

export interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
    description: string;
  } | string;
  stock: number;
  image?: string;
  images: string[];
  primaryImage: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useProducts() {
  const productList = ref<ProductFromOrder[]>([]);
  const selectedProduct = ref<ProductDetail | null>(null);
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
      const response = await api<OrderResponse>("/orders", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: 100, // Fetch more to aggregate products
        },
      });

      if (!response.success) {
        error.value = "Failed to fetch products";
        throw new Error("Failed to fetch products");
      }

      // Aggregate products from orders
      const productMap = new Map<string, ProductFromOrder>();

      response.data.forEach((order) => {
        order.items.forEach((item) => {
          const productId = item.product._id;
          
          if (productMap.has(productId)) {
            const existing = productMap.get(productId)!;
            existing.totalQuantity += item.quantity;
            existing.totalRevenue += item.subtotal;
            existing.orderCount += 1;
            
            // Update last order date if newer
            if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = order.createdAt;
            }
          } else {
            productMap.set(productId, {
              _id: productId,
              name: item.product.name,
              price: item.product.price,
              totalQuantity: item.quantity,
              totalRevenue: item.subtotal,
              orderCount: 1,
              currency: order.currency,
              lastOrderDate: order.createdAt,
            });
          }
        });
      });

      // Convert map to array and sort by revenue
      productList.value = Array.from(productMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );

      // Update pagination based on products
      const totalProducts = productList.value.length;
      const startIndex = (pagination.value.page - 1) * pagination.value.limit;
      const endIndex = startIndex + pagination.value.limit;
      
      productList.value = productList.value.slice(startIndex, endIndex);
      
      pagination.value = {
        ...pagination.value,
        total: totalProducts,
        pages: Math.ceil(totalProducts / pagination.value.limit),
        hasNext: pagination.value.page < Math.ceil(totalProducts / pagination.value.limit),
        hasPrev: pagination.value.page > 1,
      };
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
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

  const getProductById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/products/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedProduct.value = data ?? null;
      if (!selectedProduct.value) {
        error.value = "Product not found";
      }
      return selectedProduct.value;
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData: Partial<ProductDetail>) => {
    loading.value = true;

    try {
      const response = await api<any>("/products", {
        method: "POST",
        body: productData,
      });
      if (!response.success) {
        throw new Error("Failed to create product");
      }
      useToastTheme.success("Product created successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductDetail>) => {
    loading.value = true;

    try {
      const response = await api<any>(`/products/${id}`, {
        method: "PATCH",
        body: productData,
      });
      if (!response.success) {
        throw new Error("Failed to update product");
      }
      useToastTheme.success("Product updated successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/products/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete product");
      }
      useToastTheme.success("Product deleted successfully");
      await fetchData();
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProducts = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<any>("/products/bulk", {
        method: "DELETE",
        body: { productIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete products");
      }
      useToastTheme.success(`${ids.length} product(s) deleted successfully`);
      await fetchData();
    } catch (err: any) {
      useToastTheme.error(err?.message || "An error occurred");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    productList,
    selectedProduct,
    loading,
    error,
    pagination,
    fetchData,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
