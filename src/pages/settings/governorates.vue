<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useGovernorate } from "~/composable/useGovernorate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, MapPin, Eye, ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { Governorate, GovernorateCreatePayload, GovernorateUpdatePayload } from "~/types/governorate";

const router = useRouter();

const {
  governorateList,
  loading,
  pagination,
  fetchData,
  createGovernorate,
  updateGovernorate,
  deleteGovernorate,
  nextPage,
  prevPage,
} = useGovernorate();

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedGovernorate = ref<Governorate | null>(null);

const formData = ref<GovernorateCreatePayload>({
  name: "",
  nameAr: "",
  code: "",
  status: "active",
  description: "",
});

const editFormData = ref<GovernorateUpdatePayload>({
  name: "",
  nameAr: "",
  code: "",
  status: "active",
  description: "",
});

const searchQuery = ref("");
const statusFilter = ref("");

// Separate refs for Select components
const createStatus = ref<"active" | "inactive" | "maintenance">("active");
const editStatus = ref<"active" | "inactive" | "maintenance">("active");

onMounted(() => {
  fetchData();
});

const handleCreate = () => {
  formData.value = {
    name: "",
    nameAr: "",
    code: "",
    status: "active",
    description: "",
  };
  createStatus.value = "active";
  showCreateDialog.value = true;
};

const handleEdit = (governorate: Governorate) => {
  selectedGovernorate.value = governorate;
  editFormData.value = {
    name: governorate.name,
    nameAr: governorate.nameAr,
    code: governorate.code,
    status: governorate.status,
    description: governorate.description || "",
  };
  editStatus.value = governorate.status;
  showEditDialog.value = true;
};

const handleDelete = (governorate: Governorate) => {
  selectedGovernorate.value = governorate;
  showDeleteDialog.value = true;
};

const handleViewDetails = (governorate: Governorate) => {
  router.push(`/settings/governorates/${governorate._id}`);
};

const confirmCreate = async () => {
  if (!formData.value.name.trim() || !formData.value.nameAr.trim() || !formData.value.code.trim()) {
    return;
  }

  try {
    const payload = {
      ...formData.value,
      status: createStatus.value,
    };
    await createGovernorate(payload);
    showCreateDialog.value = false;
  } catch (error) {
    console.error("Failed to create governorate:", error);
  }
};

const confirmEdit = async () => {
  if (!selectedGovernorate.value) return;

  try {
    const payload = {
      ...editFormData.value,
      status: editStatus.value,
    };
    await updateGovernorate(selectedGovernorate.value._id, payload);
    showEditDialog.value = false;
    selectedGovernorate.value = null;
  } catch (error) {
    console.error("Failed to update governorate:", error);
  }
};

const confirmDelete = async () => {
  if (!selectedGovernorate.value) return;

  try {
    await deleteGovernorate(selectedGovernorate.value._id);
    showDeleteDialog.value = false;
    selectedGovernorate.value = null;
  } catch (error) {
    console.error("Failed to delete governorate:", error);
  }
};

const handleSearch = () => {
  fetchData({
    search: searchQuery.value,
    status: statusFilter.value,
    page: 1,
  });
};

const handleStatusFilter = (status: any) => {
  if (!status || typeof status !== 'string') return;
  statusFilter.value = status;
  fetchData({
    search: searchQuery.value,
    status: status === "all" ? "" : status,
    page: 1,
  });
};

const getStatusColor = (status: string) => {
  const colors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <MapPin class="h-8 w-8" />
          Governorates Management
        </h1>
        <p class="text-muted-foreground">Manage governorates and their cities</p>
      </div>
      <Button @click="handleCreate">
        <Plus class="h-4 w-4 mr-2" />
        Add Governorate
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search governorates..."
              @keyup.enter="handleSearch"
            />
          </div>
          <Select v-model="statusFilter" @update:model-value="handleStatusFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button @click="handleSearch">Search</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Governorates Table -->
    <Card>
      <CardHeader>
        <CardTitle>Governorates</CardTitle>
        <CardDescription>
          {{ pagination.total }} governorate(s) found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <!-- Table -->
        <div v-else-if="governorateList.length > 0">
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name (EN)</TableHead>
                  <TableHead>Name (AR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="governorate in governorateList"
                  :key="governorate._id"
                  class="hover:bg-muted/50"
                >
                  <TableCell>
                    <span class="font-mono font-semibold">{{ governorate.code }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="font-medium">{{ governorate.name }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="font-medium">{{ governorate.nameAr }}</span>
                  </TableCell>
                  <TableCell>
                    <div
                      :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(governorate.status)}`"
                    >
                      {{ governorate.status }}
                    </div>
                  </TableCell>
                  <TableCell class="text-muted-foreground">
                    {{ formatDate(governorate.createdAt) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleViewDetails(governorate)"
                      >
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleEdit(governorate)"
                      >
                        <Pencil class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleDelete(governorate)"
                      >
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-muted-foreground">
              Page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total)
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="prevPage"
                :disabled="pagination.page === 1"
              >
                <ChevronLeft class="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="nextPage"
                :disabled="pagination.page >= pagination.totalPages"
              >
                Next
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-10 text-center">
          <MapPin class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p class="text-muted-foreground">No governorates found</p>
          <Button class="mt-4" @click="handleCreate">
            <Plus class="h-4 w-4 mr-2" />
            Add Your First Governorate
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Create Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Governorate</DialogTitle>
          <DialogDescription>
            Create a new governorate with English and Arabic names
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Name (English) *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="e.g., Cairo"
              />
            </div>
            <div class="space-y-2">
              <Label for="nameAr">Name (Arabic) *</Label>
              <Input
                id="nameAr"
                v-model="formData.nameAr"
                placeholder="مثال: القاهرة"
                dir="rtl"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="code">Code *</Label>
              <Input
                id="code"
                v-model="formData.code"
                placeholder="e.g., CAI"
                maxlength="10"
                @input="formData.code = formData.code.toUpperCase()"
              />
            </div>
            <div class="space-y-2">
              <Label for="status">Status</Label>
              <Select v-model="createStatus">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Optional description..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false">
            Cancel
          </Button>
          <Button
            @click="confirmCreate"
            :disabled="!formData.name.trim() || !formData.nameAr.trim() || !formData.code.trim() || loading"
          >
            {{ loading ? "Creating..." : "Create Governorate" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Governorate</DialogTitle>
          <DialogDescription>
            Update governorate information
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-name">Name (English) *</Label>
              <Input
                id="edit-name"
                v-model="editFormData.name"
                placeholder="e.g., Cairo"
              />
            </div>
            <div class="space-y-2">
              <Label for="edit-nameAr">Name (Arabic) *</Label>
              <Input
                id="edit-nameAr"
                v-model="editFormData.nameAr"
                placeholder="مثال: القاهرة"
                dir="rtl"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-code">Code *</Label>
              <Input
                id="edit-code"
                v-model="editFormData.code"
                placeholder="e.g., CAI"
                maxlength="10"
                @input="editFormData.code = (editFormData.code || '').toUpperCase()"
              />
            </div>
            <div class="space-y-2">
              <Label for="edit-status">Status</Label>
              <Select v-model="editStatus">
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <textarea
              id="edit-description"
              v-model="editFormData.description"
              placeholder="Optional description..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false">
            Cancel
          </Button>
          <Button
            @click="confirmEdit"
            :disabled="loading"
          >
            {{ loading ? "Updating..." : "Update Governorate" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Governorate</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this governorate? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedGovernorate" class="py-4">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <MapPin class="h-8 w-8 text-primary" />
            <div>
              <p class="font-semibold">{{ selectedGovernorate.name }} / {{ selectedGovernorate.nameAr }}</p>
              <p class="text-sm text-muted-foreground">Code: {{ selectedGovernorate.code }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false" :disabled="loading">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="loading">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ loading ? "Deleting..." : "Delete Governorate" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
