<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProducts } from "~/composable/useProducts";
import { useCategories } from "~/composable/useCategories";
import { useImageUpload } from "~/composable/useImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "~/components/ImageUpload.vue";
import { ArrowLeft, Save } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { selectedProduct, loading, getProductById, updateProduct } = useProducts();
const { categoryList, fetchData: fetchCategories } = useCategories();
const { uploading, uploadProductImages, setPrimaryImage, deleteProductImage } = useImageUpload();

const productId = computed(() => route.params.id as string);
const saving = ref(false);

const formData = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  isActive: true,
});

const productImages = ref<string[]>([]);
const productPrimaryImage = ref<string>("");

onMounted(async () => {
  await fetchCategories();
  
  if (productId.value) {
    await getProductById(productId.value);
    
    if (selectedProduct.value) {
      formData.value = {
        name: selectedProduct.value.name,
        description: selectedProduct.value.description,
        price: selectedProduct.value.price,
        category: typeof selectedProduct.value.category === 'object' 
          ? selectedProduct.value.category._id 
          : selectedProduct.value.category,
        stock: selectedProduct.value.stock,
        isActive: selectedProduct.value.isActive,
      };
      
      productImages.value = selectedProduct.value.images || [];
      productPrimaryImage.value = selectedProduct.value.primaryImage || "";
    }
  }
});

const handleImageUpload = async (files: File[]) => {
  try {
    const urls = await uploadProductImages(productId.value, files);
    productImages.value = [...productImages.value, ...urls];
    
    // Set first image as primary if no primary image exists
    if (!productPrimaryImage.value && urls.length > 0) {
      productPrimaryImage.value = urls[0];
    }
    
    // Refresh product data
    await getProductById(productId.value);
  } catch (error) {
    console.error("Failed to upload images:", error);
  }
};

const handleImageRemove = async (url: string) => {
  try {
    await deleteProductImage(productId.value, url);
    productImages.value = productImages.value.filter(img => img !== url);
    
    // Refresh product data
    await getProductById(productId.value);
  } catch (error) {
    console.error("Failed to remove image:", error);
  }
};

const handleSetPrimary = async (url: string) => {
  try {
    await setPrimaryImage(productId.value, url);
    productPrimaryImage.value = url;
    
    // Refresh product data
    await getProductById(productId.value);
  } catch (error) {
    console.error("Failed to set primary image:", error);
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    await updateProduct(productId.value, formData.value);
    router.push(`/products/${productId.value}`);
  } catch (error) {
    console.error("Failed to update product:", error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push(`/products/${productId.value}`);
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
          <h1 class="text-3xl font-bold">Edit Product</h1>
          <p class="text-muted-foreground">Update product information</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <Card v-if="loading">
      <CardHeader>
        <Skeleton class="h-8 w-48" />
      </CardHeader>
      <CardContent class="space-y-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-10 w-full" />
      </CardContent>
    </Card>

    <!-- Edit Form -->
    <div v-else-if="selectedProduct" class="grid gap-6">
      <!-- Product Images -->
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            :model-value="productImages"
            :primary-image="productPrimaryImage"
            :multiple="true"
            :max-files="5"
            :disabled="uploading"
            @upload="handleImageUpload"
            @remove="handleImageRemove"
            @set-primary="handleSetPrimary"
          />
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
        <Button @click="handleSubmit" :disabled="saving || uploading">
          <Save class="h-4 w-4 mr-2" />
          {{ saving ? "Saving..." : "Save Changes" }}
        </Button>
      </div>
    </div>
  </div>
</template>
