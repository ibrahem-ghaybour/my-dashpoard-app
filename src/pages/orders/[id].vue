<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrders } from "~/composable/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Trash2, 
  Package, 
  User, 
  MapPin, 
  CreditCard,
  Calendar,
  FileText,
  ShoppingCart
} from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const route = useRoute();
const router = useRouter();
const { selectedOrder, loading, fetchById, deleteOrders, updateBulk } = useOrders();

const orderId = computed(() => route.params.id as string);
const showDeleteDialog = ref(false);
const deleting = ref(false);
const updatingStatus = ref(false);

onMounted(async () => {
  if (orderId.value) {
    await fetchById(orderId.value);
  }
});

const handleDelete = () => {
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteOrders([orderId.value]);
    router.push("/orders");
  } catch (error) {
    console.error("Failed to delete order:", error);
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
  }
};

const handleStatusChange = async (newStatus: any) => {
  if (!newStatus || typeof newStatus !== 'string') return;
  updatingStatus.value = true;
  try {
    await updateBulk([orderId.value], newStatus);
    await fetchById(orderId.value);
  } catch (error) {
    console.error("Failed to update order status:", error);
  } finally {
    updatingStatus.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const getRoleColor = (role: string) => {
  const colors = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    user: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  return colors[role as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/orders')">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Order Details</h1>
          <p class="text-muted-foreground">View order information</p>
        </div>
      </div>
      <div class="flex gap-2" v-if="selectedOrder && !loading">
        <Button variant="destructive" @click="handleDelete">
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton class="h-8 w-48" />
          <Skeleton class="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent class="space-y-4">
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Order Details -->
    <div v-else-if="selectedOrder" class="grid gap-6">
      <!-- Order Summary Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Package class="h-5 w-5" />
                Order {{ selectedOrder.orderCode || selectedOrder._id.slice(-8).toUpperCase() }}
              </CardTitle>
              <CardDescription>Order placed on {{ formatDate(selectedOrder.createdAt) }}</CardDescription>
            </div>
            <div class="flex items-center gap-3">
              <div :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(selectedOrder.status || 'pending')}`">
                {{ selectedOrder.status || 'pending' }}
              </div>
              <Select 
                :model-value="selectedOrder.status || 'pending'" 
                @update:model-value="handleStatusChange"
                :disabled="updatingStatus"
              >
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Total Amount -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <CreditCard class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p class="text-2xl font-bold">{{ formatCurrency(selectedOrder.totalAmount, selectedOrder.currency) }}</p>
              </div>
            </div>

            <!-- Order Date -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Order Date</p>
                <p class="text-base font-medium">{{ formatDate(selectedOrder.createdAt) }}</p>
              </div>
            </div>

            <!-- Last Updated -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p class="text-base font-medium">{{ formatDate(selectedOrder.updatedAt) }}</p>
              </div>
            </div>

            <!-- Active Status -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <FileText class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Active Status</p>
                <p class="text-base font-medium">{{ selectedOrder.isActive ? 'Active' : 'Inactive' }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedOrder.notes" class="pt-4 border-t">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <FileText class="h-5 w-5 text-primary" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                <p class="text-base">{{ selectedOrder.notes }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Customer Information -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2">
                <p class="text-lg font-semibold">{{ selectedOrder.user.name }}</p>
                <div :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getRoleColor(selectedOrder.user.role)}`">
                  {{ selectedOrder.user.role }}
                </div>
              </div>
              <p class="text-sm text-muted-foreground">{{ selectedOrder.user.email }}</p>
              <Button 
                variant="outline" 
                size="sm" 
                @click="router.push(`/users/${selectedOrder.user._id}`)"
                class="mt-2"
              >
                View Customer Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Order Items -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ShoppingCart class="h-5 w-5" />
            Order Items ({{ selectedOrder.items.length }})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div 
              v-for="(item, index) in selectedOrder.items" 
              :key="index"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="flex-1">
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatCurrency(item.price, selectedOrder.currency) }} × {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold">{{ formatCurrency(item.subtotal, selectedOrder.currency) }}</p>
              </div>
            </div>
            
            <!-- Total -->
            <div class="pt-4 border-t">
              <div class="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{{ formatCurrency(selectedOrder.totalAmount, selectedOrder.currency) }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Shipping Address -->
      <Card v-if="selectedOrder.shippingAddress">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <MapPin class="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <p class="font-semibold">{{ selectedOrder.shippingAddress.fullName }}</p>
            <p class="text-sm">{{ selectedOrder.shippingAddress.phone }}</p>
            <div class="text-sm text-muted-foreground space-y-1 mt-3">
              <p>{{ selectedOrder.shippingAddress.line1 }}</p>
              <p v-if="selectedOrder.shippingAddress.line2">{{ selectedOrder.shippingAddress.line2 }}</p>
              <p>{{ selectedOrder.shippingAddress.city }}, {{ selectedOrder.shippingAddress.governorate }}</p>
              <p>{{ selectedOrder.shippingAddress.postalCode }}</p>
              <p>{{ selectedOrder.shippingAddress.country }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else>
      <CardContent class="py-10 text-center">
        <p class="text-muted-foreground">Order not found</p>
        <Button class="mt-4" @click="router.push('/orders')">
          Back to Orders
        </Button>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedOrder" class="py-4">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Package class="h-8 w-8 text-primary" />
            <div>
              <p class="font-semibold">Order {{ selectedOrder.orderCode || selectedOrder._id.slice(-8).toUpperCase() }}</p>
              <p class="text-sm text-muted-foreground">{{ formatCurrency(selectedOrder.totalAmount, selectedOrder.currency) }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : "Delete Order" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
