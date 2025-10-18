<script setup lang="ts">
import Card from "@/components/section/home/Card.vue";
import { DollarSign } from "lucide-vue-next";
import RecentSales from "~/components/section/home/RecentSales.vue";
import Overview from "~/components/section/home/Overview.vue";
import { useDetailsDashboard } from "~/composable/useDetailsDashboard";
import { onMounted, computed } from "vue";
import { RangePicker } from "~/components/ui/date";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
//   const data = [
//   { name: "Jan", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "Feb", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "Mar", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "Apr", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "May", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "Jun", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
//   { name: "Jul", total: Math.floor(Math.random() * 2000) + 500, predicted: Math.floor(Math.random() * 2000) + 500 },
// ]
const {
  stats,
  loading,
  fetchDataDashboard,
  dateStart,
  dateEnd,
  percentageChange,
} = useDetailsDashboard();

const cardData = computed(() => {
  if (!stats.value) return [];
  
  return [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(stats.value.totalRevenue),
      change: `${percentageChange("totalRevenue") >= 0 ? "+" : ""}${percentageChange("totalRevenue").toFixed(1)}%`,
    },
    {
      title: "Subscriptions",
      value: `+${stats.value.subscriptions}`,
      change: `${percentageChange("subscriptions") >= 0 ? "+" : ""}${percentageChange("subscriptions").toFixed(1)}%`,
    },
    {
      title: "Sales",
      value: `+${stats.value.sales}`,
      change: `${percentageChange("sales") >= 0 ? "+" : ""}${percentageChange("sales").toFixed(1)}%`,
    },
    {
      title: "Active Now",
      value: `+${stats.value.activeNow}`,
      change: `${percentageChange("activeNow") >= 0 ? "+" : ""}${percentageChange("activeNow").toFixed(1)}%`,
    },
  ];
});

onMounted(() => {
  fetchDataDashboard();
});
</script>

<template>
  <main class="pt-10 space-y-4">
    <article class="flex ms-auto items-center justify-end gap-2">
      <RangePicker v-model:start="dateStart" v-model:end="dateEnd" />
      <Button @click="fetchDataDashboard">Apply</Button>
    </article>
    <article
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full"
    >
      <template v-if="loading">
        <Skeleton v-for="i in 4" :key="i" class="h-[8rem] w-full rounded-lg" />
      </template>
      <template v-else>
        <Card
          v-for="(card, index) in cardData"
          :key="index"
          :title="card.title"
          :value="card.value"
          :change="card.change"
        >
          <template #icon> <component :is="DollarSign" /> </template>
        </Card>
      </template>
    </article>
    <article
      class="grid grid-cols-1 md:grid-cols-2 items-start justify-between gap-4 w-full"
    >
      <Card title="Overview">
        <Overview v-if="!loading" :overview="stats?.overview" />
        <Skeleton v-else class="h-[24.3rem] w-full" />
      </Card>

      <Card title="Recent Sales" class="h-[31.3rem] overflow-y-auto">
        <RecentSales v-if="!loading" :recentSales="stats?.recentSales" />
        <Skeleton v-else class="h-[24.3rem] w-full" />
      </Card>
    </article>
  </main>
</template>
