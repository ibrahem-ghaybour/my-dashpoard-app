<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGovernorate } from "~/composable/useGovernorate";
import { useCity } from "~/composable/useCity";
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
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-vue-next";
import type { City, CityCreatePayload, CityUpdatePayload } from "~/types/governorate";

const route = useRoute();
const router = useRouter();

const { selectedGovernorate, cities, loading, getGovernorateById } = useGovernorate();
const {
  loading: cityLoading,
  createCity,
  updateCity,
  deleteCity,
} = useCity();

const governorateId = computed(() => route.params.id as string);

const showCreateCityDialog = ref(false);
const showEditCityDialog = ref(false);
const showDeleteCityDialog = ref(false);
const selectedCity = ref<City | null>(null);

const cityFormData = ref<CityCreatePayload>({
  name: "",
  nameAr: "",
  governorate: "",
  code: "",
  status: "active",
  description: "",
});

const editCityFormData = ref<CityUpdatePayload>({
  name: "",
  nameAr: "",
  code: "",
  status: "active",
  description: "",
});

// Ensure refs are properly initialized
const cityStatus = ref<"active" | "inactive" | "maintenance">("active");
const editCityStatus = ref<"active" | "inactive" | "maintenance">("active");

onMounted(async () => {
  if (governorateId.value) {
    await getGovernorateById(governorateId.value);
  }
});

const handleCreateCity = () => {
  cityFormData.value = {
    name: "",
    nameAr: "",
    governorate: governorateId.value,
    code: "",
    status: "active",
    description: "",
  };
  cityStatus.value = "active";
  showCreateCityDialog.value = true;
};

const handleEditCity = (city: City) => {
  selectedCity.value = city;
  editCityFormData.value = {
    name: city.name,
    nameAr: city.nameAr,
    code: city.code || "",
    status: city.status,
    description: city.description || "",
  };
  editCityStatus.value = city.status;
  showEditCityDialog.value = true;
};

const handleDeleteCity = (city: City) => {
  selectedCity.value = city;
  showDeleteCityDialog.value = true;
};

const confirmCreateCity = async () => {
  if (!cityFormData.value.name.trim() || !cityFormData.value.nameAr.trim()) {
    return;
  }

  try {
    const payload = {
      ...cityFormData.value,
      status: cityStatus.value,
    };
    await createCity(payload);
    showCreateCityDialog.value = false;
    await getGovernorateById(governorateId.value);
  } catch (error) {
    console.error("Failed to create city:", error);
  }
};

const confirmEditCity = async () => {
  if (!selectedCity.value) return;

  try {
    const payload = {
      ...editCityFormData.value,
      status: editCityStatus.value,
    };
    await updateCity(selectedCity.value._id, payload);
    showEditCityDialog.value = false;
    selectedCity.value = null;
    await getGovernorateById(governorateId.value);
  } catch (error) {
    console.error("Failed to update city:", error);
  }
};

const confirmDeleteCity = async () => {
  if (!selectedCity.value) return;

  try {
    await deleteCity(selectedCity.value._id);
    showDeleteCityDialog.value = false;
    selectedCity.value = null;
    await getGovernorateById(governorateId.value);
  } catch (error) {
    console.error("Failed to delete city:", error);
  }
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
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/settings/governorates')">
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <MapPin class="h-8 w-8" />
          Governorate Details
        </h1>
        <p class="text-muted-foreground">Manage governorate information and cities</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <!-- Content -->
    <div v-else-if="selectedGovernorate" class="space-y-6">
      <!-- Governorate Info -->
      <Card>
        <CardHeader>
          <CardTitle>Governorate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-muted-foreground">Name (English)</p>
              <p class="text-lg font-semibold">{{ selectedGovernorate.name }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Name (Arabic)</p>
              <p class="text-lg font-semibold" dir="rtl">{{ selectedGovernorate.nameAr }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Code</p>
              <p class="text-lg font-mono font-semibold">{{ selectedGovernorate.code }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Status</p>
              <div
                :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(selectedGovernorate.status)}`"
              >
                {{ selectedGovernorate.status }}
              </div>
            </div>
            <div v-if="selectedGovernorate.description" class="md:col-span-2">
              <p class="text-sm text-muted-foreground">Description</p>
              <p class="text-base">{{ selectedGovernorate.description }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Created At</p>
              <p class="text-base">{{ formatDate(selectedGovernorate.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Updated At</p>
              <p class="text-base">{{ formatDate(selectedGovernorate.updatedAt) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Cities -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Building2 class="h-5 w-5" />
                Cities
              </CardTitle>
              <CardDescription>
                {{ cities.length }} city(ies) in this governorate
              </CardDescription>
            </div>
            <Button @click="handleCreateCity">
              <Plus class="h-4 w-4 mr-2" />
              Add City
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Cities Table -->
          <div v-if="cities.length > 0" class="rounded-md border">
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
                  v-for="city in cities"
                  :key="city._id"
                  class="hover:bg-muted/50"
                >
                  <TableCell>
                    <span class="font-mono font-semibold">{{ city.code || "-" }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="font-medium">{{ city.name }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="font-medium">{{ city.nameAr }}</span>
                  </TableCell>
                  <TableCell>
                    <div
                      :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(city.status)}`"
                    >
                      {{ city.status }}
                    </div>
                  </TableCell>
                  <TableCell class="text-muted-foreground">
                    {{ formatDate(city.createdAt) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleEditCity(city)"
                      >
                        <Pencil class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleDeleteCity(city)"
                      >
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Empty State -->
          <div v-else class="py-10 text-center">
            <Building2 class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">No cities found in this governorate</p>
            <Button class="mt-4" @click="handleCreateCity">
              <Plus class="h-4 w-4 mr-2" />
              Add First City
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create City Dialog -->
    <Dialog v-model:open="showCreateCityDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
          <DialogDescription>
            Create a new city in this governorate
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city-name">Name (English) *</Label>
              <Input
                id="city-name"
                v-model="cityFormData.name"
                placeholder="e.g., Nasr City"
              />
            </div>
            <div class="space-y-2">
              <Label for="city-nameAr">Name (Arabic) *</Label>
              <Input
                id="city-nameAr"
                v-model="cityFormData.nameAr"
                placeholder="مثال: مدينة نصر"
                dir="rtl"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city-code">Code</Label>
              <Input
                id="city-code"
                v-model="cityFormData.code"
                placeholder="e.g., NSR"
                maxlength="10"
                @input="cityFormData.code = (cityFormData.code || '').toUpperCase()"
              />
            </div>
            <div class="space-y-2">
              <Label for="city-status">Status</Label>
              <Select v-model="cityStatus">
                <SelectTrigger id="city-status">
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
            <Label for="city-description">Description</Label>
            <textarea
              id="city-description"
              v-model="cityFormData.description"
              placeholder="Optional description..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCreateCityDialog = false">
            Cancel
          </Button>
          <Button
            @click="confirmCreateCity"
            :disabled="!cityFormData.name.trim() || !cityFormData.nameAr.trim() || cityLoading"
          >
            {{ cityLoading ? "Creating..." : "Create City" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit City Dialog -->
    <Dialog v-model:open="showEditCityDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit City</DialogTitle>
          <DialogDescription>
            Update city information
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-city-name">Name (English) *</Label>
              <Input
                id="edit-city-name"
                v-model="editCityFormData.name"
                placeholder="e.g., Nasr City"
              />
            </div>
            <div class="space-y-2">
              <Label for="edit-city-nameAr">Name (Arabic) *</Label>
              <Input
                id="edit-city-nameAr"
                v-model="editCityFormData.nameAr"
                placeholder="مثال: مدينة نصر"
                dir="rtl"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-city-code">Code</Label>
              <Input
                id="edit-city-code"
                v-model="editCityFormData.code"
                placeholder="e.g., NSR"
                maxlength="10"
                @input="editCityFormData.code = (editCityFormData.code || '').toUpperCase()"
              />
            </div>
            <div class="space-y-2">
              <Label for="edit-city-status">Status</Label>
              <Select v-model="editCityStatus">
                <SelectTrigger id="edit-city-status">
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
            <Label for="edit-city-description">Description</Label>
            <textarea
              id="edit-city-description"
              v-model="editCityFormData.description"
              placeholder="Optional description..."
              rows="3"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditCityDialog = false">
            Cancel
          </Button>
          <Button
            @click="confirmEditCity"
            :disabled="cityLoading"
          >
            {{ cityLoading ? "Updating..." : "Update City" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete City Dialog -->
    <Dialog v-model:open="showDeleteCityDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete City</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this city? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedCity" class="py-4">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Building2 class="h-8 w-8 text-primary" />
            <div>
              <p class="font-semibold">{{ selectedCity.name }} / {{ selectedCity.nameAr }}</p>
              <p class="text-sm text-muted-foreground" v-if="selectedCity.code">Code: {{ selectedCity.code }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteCityDialog = false" :disabled="cityLoading">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmDeleteCity" :disabled="cityLoading">
            <Trash2 class="h-4 w-4 mr-2" />
            {{ cityLoading ? "Deleting..." : "Delete City" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
