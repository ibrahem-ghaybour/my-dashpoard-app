<script setup lang="ts">
import { onMounted } from "vue"
import { useOrders } from "~/composable/useOrders"
import OrdersTable from "~/components/OrdersTable.vue"

const { orderList, fetchData, pagination, goToPage, loading, limitSize, updateBulk, deleteOrders } = useOrders()

onMounted(() => {
  fetchData()
})

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage)
}

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit)
}

const handleBulkUpdate = async (payload: { ids: string[], status: string }) => {
  await updateBulk(payload.ids, payload.status)
  await fetchData() // Refresh the data after bulk update
}

const handleBulkDelete = async (ids: string[]) => {
  if (confirm(`Are you sure you want to delete ${ids.length} order(s)? This action cannot be undone.`)) {
    await deleteOrders(ids)
    // fetchData is already called inside deleteOrders
  }
}
</script>

<template>
  <OrdersTable 
    :data="orderList" 
    :pagination="pagination" 
    :loading="loading" 
    @update:page="handlePageUpdate"
    @update:limit="handleLimitUpdate"
    @bulk-update="handleBulkUpdate"
    @bulk-delete="handleBulkDelete"
  />
</template>