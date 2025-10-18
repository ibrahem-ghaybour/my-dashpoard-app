<script setup lang="ts">
import { onMounted } from "vue"
import { useOrders } from "~/composable/useOrders"
import OrdersTable from "~/components/OrdersTable.vue"

const { orderList, fetchData, pagination, goToPage, loading, limitSize } = useOrders()

onMounted(() => {
  fetchData()
})

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage)
}

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit)
}
</script>

<template>
  <OrdersTable 
    :data="orderList" 
    :pagination="pagination" 
    :loading="loading" 
    @update:page="handlePageUpdate"
    @update:limit="handleLimitUpdate"
  />
</template>