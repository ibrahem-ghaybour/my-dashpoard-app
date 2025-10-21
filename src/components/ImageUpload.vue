<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Upload, X, Star } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";

interface Props {
  modelValue?: string[];
  primaryImage?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: true,
  maxFiles: 5,
  accept: "image/*",
  maxSize: 5,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  "update:primaryImage": [value: string];
  "upload": [files: File[]];
  "remove": [url: string];
  "setPrimary": [url: string];
}>();

const fileInput = ref<HTMLInputElement>();
const dragOver = ref(false);

const images = computed(() => props.modelValue || []);

const canAddMore = computed(() => {
  return images.value.length < props.maxFiles;
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  processFiles(Array.from(target.files));
  target.value = "";
};

const handleDrop = (event: DragEvent) => {
  dragOver.value = false;
  event.preventDefault();

  if (!event.dataTransfer?.files) return;
  processFiles(Array.from(event.dataTransfer.files));
};

const processFiles = (files: File[]) => {
  // Validate file size
  const invalidFiles = files.filter(file => file.size > props.maxSize * 1024 * 1024);
  if (invalidFiles.length > 0) {
    alert(`Some files exceed the maximum size of ${props.maxSize}MB`);
    return;
  }

  // Validate file count
  const remainingSlots = props.maxFiles - images.value.length;
  if (files.length > remainingSlots) {
    alert(`You can only upload ${remainingSlots} more image(s)`);
    files = files.slice(0, remainingSlots);
  }

  emit("upload", files);
};

const removeImage = (url: string) => {
  emit("remove", url);
};

const setPrimaryImage = (url: string) => {
  emit("setPrimary", url);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = () => {
  dragOver.value = false;
};

const openFileDialog = () => {
  if (!props.disabled) {
    fileInput.value?.click();
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      v-if="canAddMore && !disabled"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      ]"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        class="hidden"
      />

      <div class="flex flex-col items-center gap-2">
        <Upload class="h-10 w-10 text-muted-foreground" />
        <div class="text-sm">
          <span class="font-semibold text-primary">Click to upload</span>
          <span class="text-muted-foreground"> or drag and drop</span>
        </div>
        <p class="text-xs text-muted-foreground">
          PNG, JPG, GIF up to {{ maxSize }}MB
          <span v-if="multiple">({{ images.length }}/{{ maxFiles }} uploaded)</span>
        </p>
      </div>
    </div>

    <!-- Image Preview Grid -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
      >
        <img
          :src="image"
          :alt="`Image ${index + 1}`"
          class="w-full h-full object-cover"
        />

        <!-- Primary Badge -->
        <Badge
          v-if="image === primaryImage"
          variant="default"
          class="absolute top-2 left-2 gap-1"
        >
          <Star class="h-3 w-3 fill-current" />
          Primary
        </Badge>

        <!-- Action Buttons -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            v-if="image !== primaryImage && !disabled"
            variant="secondary"
            size="sm"
            @click.stop="setPrimaryImage(image)"
          >
            <Star class="h-4 w-4 mr-1" />
            Set Primary
          </Button>
          
          <Button
            v-if="!disabled"
            variant="destructive"
            size="sm"
            @click.stop="removeImage(image)"
          >
            <X class="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="images.length === 0" class="text-center py-8 text-muted-foreground">
      <p class="text-sm">No images uploaded yet</p>
    </div>
  </div>
</template>
