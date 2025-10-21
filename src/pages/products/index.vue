<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "~/composable/useProducts";
import { useCategories } from "~/composable/useCategories";
import ProductsTable from "~/components/ProductsTable.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, ShoppingCart, DollarSign, Trash2, Plus } from "lucide-vue-next";
import { computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const router = useRouter();
const { productList, fetchData, pagination, goToPage, loading, limitSize, selectedProduct, getProductById, createProduct, updateProduct, deleteProduct, deleteProducts } = useProducts();
const { categoryList, fetchData: fetchCategories } = useCategories();

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showBulkDeleteDialog = ref(false);
const productToDelete = ref<string | null>(null);
const productsToDelete = ref<string[]>([]);
const deleting = ref(false);

const createForm = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  isActive: true,
});

const editForm = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
});

onMounted(() => {
  fetchData();
  fetchCategories();
});

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage);
};

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit);
};

const handleView = (id: string) => {
  router.push(`/products/${id}`);
};

const handleCreate = () => {
  createForm.value = {
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    isActive: true,
  };
  showCreateDialog.value = true;
};

const handleSaveCreate = async () => {
  deleting.value = true;
  try {
    await createProduct(createForm.value);
    showCreateDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleEdit = async (id: string) => {
  await getProductById(id);
  if (selectedProduct.value) {
    const category = typeof selectedProduct.value.category === 'object' 
      ? selectedProduct.value.category._id 
      : selectedProduct.value.category;
    
    editForm.value = {
      name: selectedProduct.value.name,
      description: selectedProduct.value.description,
      price: selectedProduct.value.price,
      category: category,
      stock: selectedProduct.value.stock,
    };
    showEditDialog.value = true;
  }
};

const handleSaveEdit = async () => {
  if (!selectedProduct.value) return;
  
  deleting.value = true;
  try {
    await updateProduct(selectedProduct.value._id, editForm.value);
    showEditDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleDelete = (id: string) => {
  productToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;
  
  deleting.value = true;
  try {
    await deleteProduct(productToDelete.value);
    showDeleteDialog.value = false;
    productToDelete.value = null;
  } finally {
    deleting.value = false;
  }
};

const handleBulkDelete = (ids: string[]) => {
  productsToDelete.value = ids;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (productsToDelete.value.length === 0) return;
  
  deleting.value = true;
  try {
    await deleteProducts(productsToDelete.value);
    showBulkDeleteDialog.value = false;
    productsToDelete.value = [];
  } finally {
    deleting.value = false;
  }
};

// Calculate statistics
const totalProducts = computed(() => pagination.value.total);
const totalRevenue = computed(() => 
  productList.value.reduce((sum, product) => sum + product.totalRevenue, 0)
);
const totalOrders = computed(() => 
  productList.value.reduce((sum, product) => sum + product.orderCount, 0)
);
const totalItemsSold = computed(() => 
  productList.value.reduce((sum, product) => sum + product.totalQuantity, 0)
);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Products</h1>
        <p class="text-muted-foreground">Product sales analytics and performance</p>
      </div>
      <Button @click="router.push('/products/new')">
        <Plus class="h-4 w-4 mr-2" />
        Add Product
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Products</CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
          <p class="text-xs text-muted-foreground">Unique products sold</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatPrice(totalRevenue) }}</div>
          <p class="text-xs text-muted-foreground">From all products</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalOrders }}</div>
          <p class="text-xs text-muted-foreground">Orders containing products</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Items Sold</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalItemsSold.toLocaleString() }}</div>
          <p class="text-xs text-muted-foreground">Total quantity sold</p>
        </CardContent>
      </Card>
    </div>
    
    <!-- Products Table -->
    <ProductsTable
      :data="productList"
      :pagination="pagination"
      :loading="loading"
      @update:page="handlePageUpdate"
      @update:limit="handleLimitUpdate"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @bulk-delete="handleBulkDelete"
    />

    <!-- Create Product Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="create-name">Product Name *</Label>
            <Input id="create-name" v-model="createForm.name" placeholder="Enter product name" />
          </div>
          <div class="grid gap-2">
            <Label for="create-description">Description</Label>
            <Input id="create-description" v-model="createForm.description" placeholder="Enter description" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="create-price">Price *</Label>
              <Input id="create-price" type="number" v-model.number="createForm.price" placeholder="0.00" />
            </div>
            <div class="grid gap-2">
              <Label for="create-stock">Stock *</Label>
              <Input id="create-stock" type="number" v-model.number="createForm.stock" placeholder="0" />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="create-category">Category *</Label>
            <Select v-model="createForm.category">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="category in categoryList" 
                  :key="category._id" 
                  :value="category._id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button @click="handleSaveCreate" :disabled="deleting">
            <Plus class="h-4 w-4 mr-2" />
            {{ deleting ? "Creating..." : "Create Product" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Product Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">Product Name</Label>
            <Input id="name" v-model="editForm.name" />
          </div>
          <div class="grid gap-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="editForm.description" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="price">Price</Label>
              <Input id="price" type="number" v-model.number="editForm.price" />
            </div>
            <div class="grid gap-2">
              <Label for="stock">Stock</Label>
              <Input id="stock" type="number" v-model.number="editForm.stock" />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="category">Category</Label>
            <Select v-model="editForm.category">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="category in categoryList" 
                  :key="category._id" 
                  :value="category._id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button @click="handleSaveEdit" :disabled="deleting">
            {{ deleting ? "Saving..." : "Save Changes" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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

    <!-- Bulk Delete Confirmation Dialog -->
    <Dialog v-model:open="showBulkDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Multiple Products</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ productsToDelete.length }} product(s)? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showBulkDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmBulkDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : `Delete ${productsToDelete.length} Products` }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
