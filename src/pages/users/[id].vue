<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUsers } from "~/composable/useUsers";
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
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, User as UserIcon, ShoppingCart, Package, Eye } from "lucide-vue-next";
import type { OrderData } from "~/types/orders";

const route = useRoute();
const router = useRouter();
const { selectedUser, loading, getUserById, deleteUser } = useUsers();
const { fetchUserOrders } = useOrders();

const userId = computed(() => route.params.id as string);
const showDeleteDialog = ref(false);
const deleting = ref(false);
const userOrders = ref<OrderData[]>([]);
const ordersLoading = ref(false);

onMounted(async () => {
  if (userId.value) {
    await getUserById(userId.value);
    await loadUserOrders();
  }
});

const loadUserOrders = async () => {
  ordersLoading.value = true;
  try {
    userOrders.value = await fetchUserOrders(userId.value);
  } catch (error) {
    console.error("Failed to load user orders:", error);
  } finally {
    ordersLoading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/users/${userId.value}/edit`);
};

const handleDelete = () => {
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteUser(userId.value);
    router.push("/users");
  } catch (error) {
    console.error("Failed to delete user:", error);
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
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

const getRoleColor = (role: string) => {
  const colors = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    user: "bg-green-500/10 text-green-500 border-green-500/20",
    customer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  return colors[role as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const getStatusColor = (status: string) => {
  const colors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const getOrderStatusColor = (status: string) => {
  const colors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const totalOrderValue = computed(() => {
  return userOrders.value.reduce((sum, order) => sum + order.totalAmount, 0);
});
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/users')">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">User Details</h1>
          <p class="text-muted-foreground">View user information</p>
        </div>
      </div>
      <div class="flex gap-2" v-if="selectedUser && !loading">
        <Button variant="outline" @click="handleEdit">
          <Pencil class="h-4 w-4 mr-2" />
          Edit
        </Button>
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

    <!-- User Details -->
    <div v-else-if="selectedUser" class="grid gap-6 md:grid-cols-3">
      <!-- Profile Card -->
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center space-y-4">
          <div v-if="selectedUser.avatar" class="w-32 h-32 rounded-full overflow-hidden">
            <img :src="selectedUser.avatar" :alt="selectedUser.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="text-5xl font-bold text-primary">
              {{ selectedUser.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="text-center">
            <h2 class="text-2xl font-bold">{{ selectedUser.name }}</h2>
            <p class="text-muted-foreground">{{ selectedUser.email }}</p>
          </div>
          <div class="flex gap-2 w-full">
            <div :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getRoleColor(selectedUser.role)}`">
              {{ selectedUser.role }}
            </div>
            <div :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(selectedUser.status)}`">
              {{ selectedUser.status }}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Details Card -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Detailed information about the user</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Email -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Mail class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Email</p>
                <p class="text-base font-medium">{{ selectedUser.email }}</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Phone class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Phone</p>
                <p class="text-base font-medium">{{ selectedUser.phone || "Not provided" }}</p>
              </div>
            </div>

            <!-- Gender -->
            <div class="flex items-start gap-3" v-if="selectedUser.gender">
              <div class="p-2 bg-primary/10 rounded-lg">
                <UserIcon class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Gender</p>
                <p class="text-base font-medium capitalize">{{ selectedUser.gender }}</p>
              </div>
            </div>

            <!-- Birthdate -->
            <div class="flex items-start gap-3" v-if="selectedUser.birthdate">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Birthdate</p>
                <p class="text-base font-medium">
                  {{ new Date(selectedUser.birthdate).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <!-- Created At -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Created At</p>
                <p class="text-base font-medium">{{ formatDate(selectedUser.createdAt) }}</p>
              </div>
            </div>

            <!-- Updated At -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Calendar class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p class="text-base font-medium">{{ formatDate(selectedUser.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- User Orders -->
      <Card class="md:col-span-3">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <ShoppingCart class="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>All orders placed by this user</CardDescription>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm text-muted-foreground">Total Orders</p>
                <p class="text-2xl font-bold">{{ userOrders.length }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-muted-foreground">Total Value</p>
                <p class="text-2xl font-bold">{{ formatCurrency(totalOrderValue) }}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Loading State -->
          <div v-if="ordersLoading" class="space-y-3">
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-20 w-full" />
          </div>

          <!-- Orders List -->
          <div v-else-if="userOrders.length > 0" class="space-y-3">
            <div 
              v-for="order in userOrders" 
              :key="order._id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              @click="router.push(`/orders/${order._id}`)"
            >
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <Package class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="font-semibold">Order {{ order.orderCode || order._id.slice(-8).toUpperCase() }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatDate(order.createdAt) }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getOrderStatusColor(order.status || 'pending')}`">
                      {{ order.status || 'pending' }}
                    </div>
                    <span class="text-xs text-muted-foreground">{{ order.items.length }} item(s)</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-lg font-bold">{{ formatCurrency(order.totalAmount, order.currency) }}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Eye class="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-10 text-center">
            <Package class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">No orders found for this user</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else>
      <CardContent class="py-10 text-center">
        <p class="text-muted-foreground">User not found</p>
        <Button class="mt-4" @click="router.push('/users')">
          Back to Users
        </Button>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedUser" class="py-4">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div v-if="selectedUser.avatar" class="w-12 h-12 rounded-full overflow-hidden">
              <img :src="selectedUser.avatar" :alt="selectedUser.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="text-lg font-bold text-primary">
                {{ selectedUser.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="font-semibold">{{ selectedUser.name }}</p>
              <p class="text-sm text-muted-foreground">{{ selectedUser.email }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : "Delete User" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
