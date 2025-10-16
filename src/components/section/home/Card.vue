<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const props = defineProps<{
  title?: string;
  value?: string;
  change?: string;
}>();
</script>
<template>
  <Card>
    <CardHeader
      class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <CardTitle class="text-sm font-medium"> {{ props.title }} </CardTitle>
      <slot name="icon"></slot>
    </CardHeader>
    <CardContent>
      <slot>
        <div class="text-2xl font-bold"> {{ props.value }} </div>
      <p class="text-xs text-muted-foreground"> {{ props.change }} from last month</p>
      </slot>
    </CardContent>
  </Card>
</template>
