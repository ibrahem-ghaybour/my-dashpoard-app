<script setup lang="ts">
import { useRouter } from "vue-router";
import CreateOrderForm from "~/components/CreateOrderForm.vue";
import { ArrowLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const router = useRouter();

const handleSuccess = (orderId: string) => {
  router.push(`/orders/${orderId}`);
};

const handleCancel = () => {
  router.push("/orders");
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/orders')">
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold">Create Order</h1>
        <p class="text-muted-foreground">Add a new order to the system</p>
      </div>
    </div>

    <!-- Form -->
    <CreateOrderForm @success="handleSuccess" @cancel="handleCancel" />
  </div>
</template>
