<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProducts } from "~/composable/useProducts";
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
import { ArrowLeft, Trash2, Package, DollarSign, Box, Tag, Image as ImageIcon } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { selectedProduct, loading, getProductById, deleteProduct } = useProducts();

const productId = computed(() => route.params.id as string);
const showDeleteDialog = ref(false);
const deleting = ref(false);

onMounted(async () => {
  if (productId.value) {
    await getProductById(productId.value);
  }
});



const handleDelete = () => {
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteProduct(productId.value);
    router.push("/products");
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
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

const getCategoryName = (category: any) => {
  return typeof category === 'object' ? category.name : category;
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/products')">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Product Details</h1>
          <p class="text-muted-foreground" v-if="selectedProduct">
            {{ selectedProduct.name }}
          </p>
        </div>
      </div>
      <div v-if="selectedProduct" class="flex gap-2">
    
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
          <Skeleton class="h-32 w-full" />
          <Skeleton class="h-32 w-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Product Details -->
    <div v-else-if="selectedProduct" class="grid gap-6 md:grid-cols-3">
      <!-- Main Info Card -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Basic product details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Product Image -->
          <div v-if="selectedProduct.image" class="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img
              :src="selectedProduct.image"
              :alt="selectedProduct.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="aspect-video relative overflow-hidden rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon class="h-24 w-24 text-muted-foreground" />
          </div>

          <!-- Name -->
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Package class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">Product Name</p>
              <p class="text-lg font-bold">{{ selectedProduct.name }}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Package class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">Description</p>
              <p class="text-base">{{ selectedProduct.description || 'No description available' }}</p>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <DollarSign class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">Price</p>
              <p class="text-2xl font-bold text-green-600">{{ formatPrice(selectedProduct.price) }}</p>
            </div>
          </div>

          <!-- Category -->
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Tag class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">Category</p>
              <p class="text-base font-medium">{{ getCategoryName(selectedProduct.category) }}</p>
            </div>
          </div>

          <!-- Stock -->
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Box class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">Stock</p>
              <p class="text-base font-medium">
                {{ selectedProduct.stock }} units
                <span 
                  :class="[
                    'ml-2 text-xs px-2 py-1 rounded-full',
                    selectedProduct.stock > 10 ? 'bg-green-500/10 text-green-500' : 
                    selectedProduct.stock > 0 ? 'bg-yellow-500/10 text-yellow-500' : 
                    'bg-red-500/10 text-red-500'
                  ]"
                >
                  {{ selectedProduct.stock > 10 ? 'In Stock' : selectedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock' }}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Status & Metadata Card -->
      <Card>
        <CardHeader>
          <CardTitle>Status & Metadata</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Active Status -->
          <div>
            <p class="text-sm font-medium text-muted-foreground mb-2">Status</p>
            <div 
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                selectedProduct.isActive 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
              ]"
            >
              {{ selectedProduct.isActive ? 'Active' : 'Inactive' }}
            </div>
          </div>

          <!-- Created At -->
          <div>
            <p class="text-sm font-medium text-muted-foreground">Created At</p>
            <p class="text-sm">{{ formatDate(selectedProduct.createdAt) }}</p>
          </div>

          <!-- Updated At -->
          <div>
            <p class="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p class="text-sm">{{ formatDate(selectedProduct.updatedAt) }}</p>
          </div>

          <!-- Created By -->
          <div v-if="selectedProduct.createdBy">
            <p class="text-sm font-medium text-muted-foreground">Created By</p>
            <p class="text-sm font-medium">{{ selectedProduct.createdBy.name }}</p>
            <p class="text-xs text-muted-foreground">{{ selectedProduct.createdBy.email }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else>
      <CardContent class="py-10 text-center">
        <p class="text-muted-foreground">Product not found</p>
        <Button class="mt-4" @click="router.push('/products')">
          Back to Products
        </Button>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedProduct" class="py-4">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Package class="h-8 w-8 text-muted-foreground" />
            <div>
              <p class="font-semibold">{{ selectedProduct.name }}</p>
              <p class="text-sm text-muted-foreground">{{ formatPrice(selectedProduct.price) }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : "Delete Product" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
