<script setup lang="ts">
import Card from "@/components/section/home/Card.vue";
import { DollarSign } from "lucide-vue-next";
import RecentSales from "~/components/section/home/RecentSales.vue";
import Overview from "~/components/section/home/Overview.vue";
import { useDetailsDashboard } from "~/composable/useDetailsDashboard";
import { onMounted } from "vue";
const data = [
  { name: "Jan", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "Feb", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "Mar", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "Apr", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "May", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jun", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
  { name: "Jul", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
]
const { stats, loading, percentageChange, fetchDataDashboard, dateStart, dateEnd } =
  useDetailsDashboard();
onMounted(() => {
  fetchDataDashboard();
});
</script>

<template>
  <main class="pt-10 space-y-4">
    <article
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full"
    >
      <Card
        v-for="i in 4"
        :key="i"
        title="Total Revenue"
        value="$45,231.89"
        change="+20.1%"
      >
        <template #icon> <component :is="DollarSign" /> </template>
      </Card>
    </article>
    <article class="grid grid-cols-1 md:grid-cols-2 items-start justify-between gap-4  w-full">
      <Card title="Overview"><Overview :overview="stats?.overview" /></Card>
     
      <Card title="Recent Sales" class="h-[31.3rem] overflow-y-auto"><RecentSales :recentSales="stats?.recentSales" /></Card>
    </article>
   
  </main>
</template>
