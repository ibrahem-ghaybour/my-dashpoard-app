<script setup lang="ts">
import { onMounted } from "vue";
import { useWishlist } from "~/composable/useWishlist";
import WishlistTable from "~/components/WishlistTable.vue";

const { wishlistList, fetchData, pagination, goToPage, loading, limitSize } = useWishlist();

onMounted(() => {
  fetchData();
});

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage);
};

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit);
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Wishlists</h1>
      <p class="text-muted-foreground">Manage user wishlists</p>
    </div>
    
    <WishlistTable
      :data="wishlistList"
      :pagination="pagination"
      :loading="loading"
      @update:page="handlePageUpdate"
      @update:limit="handleLimitUpdate"
    />
  </div>
</template>
