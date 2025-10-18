<script setup lang="ts">
import { onMounted } from "vue";
import { useUsers } from "~/composable/useUsers";
import UsersTable from "~/components/UsersTable.vue";

const { userList, fetchData, pagination, goToPage, loading, limitSize, deleteUsers } = useUsers();

onMounted(() => {
  fetchData();
});

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage);
};

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit);
};

const handleBulkDelete = async (ids: string[]) => {
  if (
    confirm(
      `Are you sure you want to delete ${ids.length} user(s)? This action cannot be undone.`
    )
  ) {
    await deleteUsers(ids);
  }
};
</script>

<template>
  <UsersTable
    :data="userList"
    :pagination="pagination"
    :loading="loading"
    @update:page="handlePageUpdate"
    @update:limit="handleLimitUpdate"
    @bulk-delete="handleBulkDelete"
  />
</template>
