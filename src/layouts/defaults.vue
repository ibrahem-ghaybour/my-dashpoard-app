<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <SidebarTrigger />
      <Container ><router-view /></Container>
    </SidebarInset>
  </SidebarProvider>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import AppSidebar from "~/components/layouts/AppSidebar.vue";
import { SidebarProvider } from "@/components/ui/sidebar";
import Container from "~/components/layouts/Container.vue";
import SidebarTrigger from "~/components/ui/sidebar/SidebarTrigger.vue";
import SidebarInset from "~/components/ui/sidebar/SidebarInset.vue";
const authStore = useAuthStore();
onMounted(async() => {
  authStore.fetchMe();
});
</script>

<style></style>
