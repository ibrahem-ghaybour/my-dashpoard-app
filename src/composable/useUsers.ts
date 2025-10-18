import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";
import type { User, UserListResponse } from "~/types/user";

export function useUsers() {
  const userList = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
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
      const response = await api<UserListResponse>("/users", {
        method: "GET",
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
        },
      });

      if (!response.success) {
        error.value = "Failed to fetch users";
        throw new Error("Failed to fetch users");
      }

      userList.value = response.data;
      pagination.value = response.pagination;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getUserById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api<any>(`/users/${id}`, {
        method: "GET",
      });
      const data = response?.data;
      selectedUser.value = data ?? null;
      if (!selectedUser.value) {
        error.value = "User not found";
      }
      return selectedUser.value;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    loading.value = true;

    try {
      const response = await api<any>(`/users/${id}`, {
        method: "PATCH",
        body: userData,
      });
      if (!response.success) {
        throw new Error("Failed to update user");
      }
      useToastTheme.success("User updated successfully");
      return response.data;
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    loading.value = true;

    try {
      const response = await api<any>(`/users/${id}`, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new Error("Failed to delete user");
      }
      await fetchData();
      useToastTheme.success("User deleted successfully");
    } catch (err) {
      useToastTheme.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUsers = async (ids: string[]) => {
    loading.value = true;

    try {
      const response = await api<UserListResponse>("/users/bulk", {
        method: "DELETE",
        body: { userIds: ids },
      });
      if (!response.success) {
        throw new Error("Failed to delete users");
      }
      await fetchData();
      useToastTheme.success("Users deleted successfully");
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
    userList,
    selectedUser,
    loading,
    error,
    pagination,
    fetchData,
    getUserById,
    updateUser,
    deleteUser,
    deleteUsers,
    goToPage,
    nextPage,
    prevPage,
    limitSize,
  };
}
