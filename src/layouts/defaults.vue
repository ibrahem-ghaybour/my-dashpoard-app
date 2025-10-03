<template>
  <SidebarProvider>
    <AppSidebar />
    <Container><router-view /></Container>
  </SidebarProvider>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import AppSidebar from "~/components/layouts/AppSidebar.vue";
import { SidebarProvider } from "@/components/ui/sidebar";
import Container from "~/components/layouts/Container.vue";
const authStore = useAuthStore();
onMounted(async() => {
  authStore.fetchMe();
});
</script>

<style></style>
