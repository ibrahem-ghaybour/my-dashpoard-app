<script setup lang="ts">
import { onMounted } from "vue";
import { useCarts } from "~/composable/useCarts";
import CartsTable from "~/components/CartsTable.vue";

const { cartList, fetchData, pagination, goToPage, loading, limitSize, deleteCarts } = useCarts();

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
      `Are you sure you want to delete ${ids.length} cart(s)? This action cannot be undone.`
    )
  ) {
    await deleteCarts(ids);
  }
};
</script>

<template>
  <CartsTable
    :data="cartList"
    :pagination="pagination"
    :loading="loading"
    @update:page="handlePageUpdate"
    @update:limit="handleLimitUpdate"
    @bulk-delete="handleBulkDelete"
  />
</template>
