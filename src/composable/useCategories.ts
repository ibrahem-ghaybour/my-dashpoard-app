import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { Category, CategoryResponse } from "~/types/category";

export function useCategories() {
  const categoryList = ref<Category[]>([]);
  const selectedCategory = ref<Category | null>(null);
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
      const response = await api<CategoryResponse>("/categories", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
        },
      });

      if (!response.success) {
        error.value = "Failed to fetch categories";
        throw new Error("Failed to fetch categories");
      }

      categoryList.value = response.data;
      pagination.value = {
        ...response.pagination,
        hasNext: response.pagination.page < response.pagination.pages,
        hasPrev: response.pagination.page > 1,
      };
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/categories/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedCategory.value = data ?? null;
      if (!selectedCategory.value) {
        error.value = "Category not found";
      }
      return selectedCategory.value;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: Partial<Category>) => {
    loading.value = true;

    try {
      const response = await api<any>("/categories", {
        method: "POST",
        body: categoryData,
      });
      if (!response.success) {
        throw new Error("Failed to create category");
      }
      useToastTheme.success("Category created successfully");
      await fetchData();
      return response.data;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    loading.value = true;

    try {
      const response = await api<any>(`/categories/${id}`, {
        method: "PATCH",
        body: categoryData,
      });
      if (!response.success) {
        throw new Error("Failed to update category");
      }
      useToastTheme.success("Category updated successfully");
      await fetchData();
      return response.data;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete category");
      }
      useToastTheme.success("Category deleted successfully");
      await fetchData();
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategories = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<any>("/categories/bulk", {
        method: "DELETE",
        body: { categoryIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete categories");
      }
      useToastTheme.success(`${ids.length} category(ies) deleted successfully`);
      await fetchData();
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
    categoryList,
    selectedCategory,
    loading,
    error,
    pagination,
    fetchData,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteCategories,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
