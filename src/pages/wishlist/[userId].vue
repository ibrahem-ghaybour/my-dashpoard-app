<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWishlist } from "~/composable/useWishlist";
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
import { ArrowLeft, Heart, Trash2, ShoppingCart } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { selectedWishlist, loading, getWishlistByUserId, deleteWishlistItem, clearWishlist } = useWishlist();

const userId = computed(() => route.params.userId as string);
const showDeleteDialog = ref(false);
const showClearDialog = ref(false);
const itemToDelete = ref<string | null>(null);
const deleting = ref(false);

onMounted(async () => {
  if (userId.value) {
    await getWishlistByUserId(userId.value);
  }
});

const handleDeleteItem = (itemId: string) => {
  itemToDelete.value = itemId;
  showDeleteDialog.value = true;
};

const confirmDeleteItem = async () => {
  if (!itemToDelete.value) return;
  
  deleting.value = true;
  try {
    await deleteWishlistItem(userId.value, itemToDelete.value);
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    itemToDelete.value = null;
  }
};

const handleClearWishlist = () => {
  showClearDialog.value = true;
};

const confirmClearWishlist = async () => {
  deleting.value = true;
  try {
    await clearWishlist(userId.value);
    router.push("/wishlist");
  } finally {
    deleting.value = false;
    showClearDialog.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/wishlist')">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Wishlist Details</h1>
          <p class="text-muted-foreground" v-if="selectedWishlist">
            {{ selectedWishlist.user.name }}'s wishlist
          </p>
        </div>
      </div>
      <Button
        v-if="selectedWishlist && selectedWishlist.items.length > 0"
        variant="destructive"
        @click="handleClearWishlist"
      >
        <Trash2 class="h-4 w-4 mr-2" />
        Clear Wishlist
      </Button>
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

    <!-- Wishlist Content -->
    <div v-else-if="selectedWishlist" class="space-y-6">
      <!-- User Info Card -->
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Name</p>
              <p class="text-base font-semibold">{{ selectedWishlist.user.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Email</p>
              <p class="text-base font-semibold">{{ selectedWishlist.user.email }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Items</p>
              <p class="text-base font-semibold flex items-center gap-2">
                <Heart class="h-4 w-4 text-red-500" />
                {{ selectedWishlist.wishlistCount }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Wishlist Items -->
      <div v-if="selectedWishlist.items.length > 0">
        <h2 class="text-2xl font-bold mb-4">Wishlist Items</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="item in selectedWishlist.items"
            :key="item._id"
            class="overflow-hidden"
          >
            <div class="aspect-video relative overflow-hidden bg-muted">
              <img
                v-if="item.product.imageUrl"
                :src="item.product.imageUrl"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <ShoppingCart class="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardHeader>
              <CardTitle class="text-lg">{{ item.product.name }}</CardTitle>
              <CardDescription class="line-clamp-2">
                {{ item.product.description }}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Price</span>
                <span class="text-lg font-bold text-primary">
                  {{ formatPrice(item.product.price) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Category</span>
                <span class="text-sm font-medium">{{ item.product.category }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Added</span>
                <span class="text-sm">{{ formatDate(item.createdAt) }}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                class="w-full mt-2"
                @click="handleDeleteItem(item._id)"
              >
                <Trash2 class="h-4 w-4 mr-2" />
                Remove
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Empty State -->
      <Card v-else>
        <CardContent class="py-10 text-center">
          <Heart class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p class="text-lg font-medium">Wishlist is empty</p>
          <p class="text-muted-foreground">This user hasn't added any items to their wishlist yet.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-else>
      <CardContent class="py-10 text-center">
        <p class="text-muted-foreground">Wishlist not found</p>
        <Button class="mt-4" @click="router.push('/wishlist')">
          Back to Wishlists
        </Button>
      </CardContent>
    </Card>

    <!-- Delete Item Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this item from the wishlist?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDeleteItem" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Removing..." : "Remove Item" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clear Wishlist Dialog -->
    <Dialog v-model:open="showClearDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Wishlist</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear this entire wishlist? This will remove all {{ selectedWishlist?.wishlistCount }} items.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showClearDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmClearWishlist" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Clearing..." : "Clear Wishlist" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
