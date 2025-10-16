<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RecentSale } from "~/types/detailsDashboard";
const props = defineProps<{
  recentSales?: RecentSale[];
}>();
</script>

<template>
  <div class="space-y-8 ">
    <div v-for="sale in recentSales" :key="sale._id" class="flex items-center flex-wrap">
      <Avatar class="h-9 w-9">
        <AvatarImage src="/avatars/01.png" alt="Avatar" />
        <AvatarFallback>{{ sale?.user?.name.slice(0, 2) }}</AvatarFallback>
      </Avatar>
      <div class="ml-4 space-y-1">
        <p class="text-sm font-medium leading-none">{{ sale?.user?.name }}</p>
        <p class="text-sm text-muted-foreground">{{ sale?.user?.email }}</p>
      </div>
      <div class="ml-auto font-medium">
        +{{ sale.totalAmount }}
      </div>
    </div>
  </div>
</template>
