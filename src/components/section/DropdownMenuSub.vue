<script lang="ts" setup>
import type { Component } from "vue";
import { DropdownMenuSub } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
type MenuItem = {
  text: string;
  fun: () => void;
  disabled?: boolean;
  icon?: Component;
};

const props = defineProps<{
  triggerText: string;
  icon?: Component;
  accept?: string;
  content: MenuItem[];
}>();
</script>
<template>
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <component :is="props.icon" class="mr-2 h-4 w-4" v-if="props.icon" />
      <span>{{ props.triggerText }}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          v-for="item in props.content"
          :key="item.text"
          @click="item.fun"
          :disabled="item.disabled"
        >
          <component
            :is="item.icon"
            :class="[
              'mr-2 h-4 w-4',
              { 'text-[#525252]': props.accept === item.text },
            ]"
            v-if="item.icon"
          />
          <span>{{ item.text }}</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
</template>

<style></style>
