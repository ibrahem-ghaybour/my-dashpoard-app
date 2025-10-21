<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "~/composable/useProducts";
import { useCategories } from "~/composable/useCategories";
import { useImageUpload } from "~/composable/useImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-vue-next";

const router = useRouter();
const { createProduct } = useProducts();
const { categoryList, fetchData: fetchCategories } = useCategories();
const { uploadProductImages } = useImageUpload();

const saving = ref(false);
const pendingImages = ref<File[]>([]);

const formData = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  isActive: true,
});

onMounted(async () => {
  await fetchCategories();
});

const handleImageSelect = (files: File[]) => {
  pendingImages.value = [...pendingImages.value, ...files];
};

const removePendingImage = (index: number) => {
  pendingImages.value = pendingImages.value.filter((_, i) => i !== index);
};

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.description || !formData.value.category) {
    alert("Please fill in all required fields");
    return;
  }

  saving.value = true;
  try {
    // Create product first
    const product = await createProduct(formData.value);
    
    // Upload images if any
    if (pendingImages.value.length > 0 && product._id) {
      await uploadProductImages(product._id, pendingImages.value);
    }
    
    router.push(`/products/${product._id}`);
  } catch (error) {
    console.error("Failed to create product:", error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push("/products");
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="handleCancel">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Create New Product</h1>
          <p class="text-muted-foreground">Add a new product to your inventory</p>
        </div>
      </div>
    </div>

    <!-- Create Form -->
    <div class="grid gap-6">
      <!-- Product Images (Preview Only) -->
      <Card>
        <CardHeader>
          <CardTitle>Product Images (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                @change="(e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleImageSelect(Array.from(files));
                }"
                class="hidden"
                id="image-upload"
              />
              <label for="image-upload" class="cursor-pointer">
                <div class="flex flex-col items-center gap-2">
                  <Plus class="h-10 w-10 text-muted-foreground" />
                  <div class="text-sm">
                    <span class="font-semibold text-primary">Click to upload</span>
                    <span class="text-muted-foreground"> images (up to 5)</span>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </label>
            </div>

            <!-- Pending Images Preview -->
            <div v-if="pendingImages.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(file, index) in pendingImages"
                :key="index"
                class="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              >
                <img
                  :src="URL.createObjectURL(file)"
                  :alt="file.name"
                  class="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2 h-8 w-8"
                  @click="removePendingImage(index)"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Product Information -->
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="name">Product Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Enter product name"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="category">Category *</Label>
              <Select v-model="formData.category">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

          <div class="space-y-2">
            <Label for="description">Description *</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter product description"
              rows="4"
              required
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="price">Price *</Label>
              <Input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="stock">Stock *</Label>
              <Input
                id="stock"
                v-model.number="formData.stock"
                type="number"
                min="0"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <input
              id="isActive"
              v-model="formData.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300"
            />
            <Label for="isActive" class="cursor-pointer">Active</Label>
          </div>
        </CardContent>
      </Card>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleCancel" :disabled="saving">
          Cancel
        </Button>
        <Button @click="handleSubmit" :disabled="saving">
          <Plus class="h-4 w-4 mr-2" />
          {{ saving ? "Creating..." : "Create Product" }}
        </Button>
      </div>
    </div>
  </div>
</template>
