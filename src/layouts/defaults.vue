<template>
  <SidebarProvider>
    <AppSidebar />
    <Container><router-view /></Container>
  </SidebarProvider>
</template>

<script lang="ts" setup>
import AppSidebar from "~/components/layouts/AppSidebar.vue";
import { SidebarProvider } from "@/components/ui/sidebar";
import Container from "~/components/layouts/Container.vue";
</script>

<style></style>
