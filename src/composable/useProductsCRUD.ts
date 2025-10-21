import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";

export interface Product {
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

export interface ProductsResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export function useProductsCRUD() {
  const productList = ref<Product[]>([]);
  const selectedProduct = ref<Product | null>(null);
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
      const response = await api<ProductsResponse>("/products", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
        },
      });

      if (!response.success) {
        throw new Error("Failed to fetch products");
      }

      productList.value = response.data;
      pagination.value = response.pagination;
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to fetch products";
      error.value = errorMsg;
      useToastTheme.error(errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getProductById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<ProductResponse>(`/products/${id}`, {
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Product not found");
      }

      selectedProduct.value = response.data;
      return selectedProduct.value;
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to fetch product";
      error.value = errorMsg;
      useToastTheme.error(errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData: Partial<Product>) => {
    loading.value = true;

    try {
      const response = await api<ProductResponse>("/products", {
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
      useToastTheme.error(err?.message || "Failed to create product");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    loading.value = true;

    try {
      const response = await api<ProductResponse>(`/products/${id}`, {
        method: "PUT",
        body: productData,
      });

      if (!response.success) {
        throw new Error("Failed to update product");
      }

      useToastTheme.success("Product updated successfully");
      await fetchData();
      return response.data;
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to update product");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<{ success: boolean; message: string }>(
        `/products/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.success) {
        throw new Error("Failed to delete product");
      }

      useToastTheme.success("Product deleted successfully");
      await fetchData();
    } catch (err: any) {
      useToastTheme.error(err?.message || "Failed to delete product");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const goToPage = (page: number) => {
    pagination.value.page = page;
    fetchData();
  };

  const limitSize = (limit: number) => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchData();
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
    goToPage,
    limitSize,
  };
}
