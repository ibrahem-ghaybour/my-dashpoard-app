<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { ErrorMessage } from "vee-validate";
import { toValue } from "vue";
import { cn } from "@/lib/utils";
import { useFormField } from "./useFormField";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const { name, formMessageId } = useFormField();
</script>

<template>
  <Transition>
    <ErrorMessage
      :id="formMessageId"
      data-slot="form-message"
      as="p"
      :name="toValue(name)"
      :class="cn('text-destructive text-sm ', props.class)"
  /></Transition>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition:0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
