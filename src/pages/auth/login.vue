<!-- <script lang="ts">
export const description = "A two column login page with a cover image."
</script> -->

<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next"
import LoginForm from "@/components/auth/LoginForm.vue"
import ColoursSpinner from "~/components/ColoursSpinner.vue";
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <a href="#" class="flex items-center gap-2 font-medium">
          <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd class-name="size-4" />
          </div>
          Acme Inc.
        </a>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
    </div>
    <div class="relative hidden bg-muted lg:flex items-center justify-center ">
        <ColoursSpinner class=""/>
    </div>
  </div>
</template>
