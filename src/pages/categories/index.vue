<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCategories } from "~/composable/useCategories";
import CategoriesTable from "~/components/CategoriesTable.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Plus, Trash2 } from "lucide-vue-next";
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
import { Switch } from "@/components/ui/switch";

const router = useRouter();
const { categoryList, fetchData, pagination, goToPage, loading, limitSize, selectedCategory, getCategoryById, createCategory, updateCategory, deleteCategory, deleteCategories } = useCategories();

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showBulkDeleteDialog = ref(false);
const categoryToDelete = ref<string | null>(null);
const categoriesToDelete = ref<string[]>([]);
const deleting = ref(false);

const createForm = ref({
  name: "",
  description: "",
  isActive: true,
});

const editForm = ref({
  name: "",
  description: "",
  isActive: true,
});

onMounted(() => {
  fetchData();
});

const handlePageUpdate = (newPage: number) => {
  goToPage(newPage);
};

const handleLimitUpdate = (newLimit: number) => {
  limitSize(newLimit);
};

const handleView = (id: string) => {
  router.push(`/categories/${id}`);
};

const handleCreate = () => {
  createForm.value = {
    name: "",
    description: "",
    isActive: true,
  };
  showCreateDialog.value = true;
};

const handleSaveCreate = async () => {
  deleting.value = true;
  try {
    await createCategory(createForm.value);
    showCreateDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleEdit = async (id: string) => {
  await getCategoryById(id);
  if (selectedCategory.value) {
    editForm.value = {
      name: selectedCategory.value.name,
      description: selectedCategory.value.description,
      isActive: selectedCategory.value.isActive,
    };
    showEditDialog.value = true;
  }
};

const handleSaveEdit = async () => {
  if (!selectedCategory.value) return;
  
  deleting.value = true;
  try {
    await updateCategory(selectedCategory.value._id, editForm.value);
    showEditDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

const handleDelete = (id: string) => {
  categoryToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!categoryToDelete.value) return;
  
  deleting.value = true;
  try {
    await deleteCategory(categoryToDelete.value);
    showDeleteDialog.value = false;
    categoryToDelete.value = null;
  } finally {
    deleting.value = false;
  }
};

const handleBulkDelete = (ids: string[]) => {
  categoriesToDelete.value = ids;
  showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
  if (categoriesToDelete.value.length === 0) return;
  
  deleting.value = true;
  try {
    await deleteCategories(categoriesToDelete.value);
    showBulkDeleteDialog.value = false;
    categoriesToDelete.value = [];
  } finally {
    deleting.value = false;
  }
};

const totalCategories = computed(() => pagination.value.total);
const activeCategories = computed(() => 
  categoryList.value.filter(cat => cat.isActive).length
);
const inactiveCategories = computed(() => 
  categoryList.value.filter(cat => !cat.isActive).length
);
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Categories</h1>
        <p class="text-muted-foreground">Manage product categories</p>
      </div>
      <Button @click="handleCreate">
        <Plus class="h-4 w-4 mr-2" />
        Create Category
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Categories</CardTitle>
          <Tag class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalCategories }}</div>
          <p class="text-xs text-muted-foreground">All categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active</CardTitle>
          <Tag class="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{{ activeCategories }}</div>
          <p class="text-xs text-muted-foreground">Active categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Inactive</CardTitle>
          <Tag class="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-gray-600">{{ inactiveCategories }}</div>
          <p class="text-xs text-muted-foreground">Inactive categories</p>
        </CardContent>
      </Card>
    </div>
    
    <!-- Categories Table -->
    <CategoriesTable
      :data="categoryList"
      :pagination="pagination"
      :loading="loading"
      @update:page="handlePageUpdate"
      @update:limit="handleLimitUpdate"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @bulk-delete="handleBulkDelete"
    />

    <!-- Create Category Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category for your products
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="create-name">Category Name *</Label>
            <Input id="create-name" v-model="createForm.name" placeholder="Enter category name" />
          </div>
          <div class="grid gap-2">
            <Label for="create-description">Description</Label>
            <Input id="create-description" v-model="createForm.description" placeholder="Enter description" />
          </div>
          <div class="flex items-center space-x-2">
            <Switch id="create-active" v-model:checked="createForm.isActive" />
            <Label for="create-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button @click="handleSaveCreate" :disabled="deleting">
            <Plus class="h-4 w-4 mr-2" />
            {{ deleting ? "Creating..." : "Create Category" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Category Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category information
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="edit-name">Category Name</Label>
            <Input id="edit-name" v-model="editForm.name" />
          </div>
          <div class="grid gap-2">
            <Label for="edit-description">Description</Label>
            <Input id="edit-description" v-model="editForm.description" />
          </div>
          <div class="flex items-center space-x-2">
            <Switch id="edit-active" v-model:checked="editForm.isActive" />
            <Label for="edit-active">Active</Label>
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : "Delete Category" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Bulk Delete Confirmation Dialog -->
    <Dialog v-model:open="showBulkDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Multiple Categories</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ categoriesToDelete.length }} category(ies)? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showBulkDeleteDialog = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmBulkDelete" :disabled="deleting">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ deleting ? "Deleting..." : `Delete ${categoriesToDelete.length} Categories` }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
