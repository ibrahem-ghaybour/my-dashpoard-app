<script setup lang="ts">
import { Check, ChevronDown, MoreHorizontal } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type ActionItem = {
  label: string;
  action: () => void;
};
defineProps<{
  payment: { id: string };
  actions: ActionItem[];
  textDropdownTrigger?: string;
}>();
</script>

<template>
  <DropdownMenu >
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-full">
        <span v-if="textDropdownTrigger" class="flex items-center  gap-2 "
          >{{ textDropdownTrigger }} <ChevronDown class="w-4 h-4"
        /></span>
        <MoreHorizontal v-else class="w-4 h-4" />
      </Button> 
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="action in actions"
        :key="action.label"
        :class="[
          payment.id !== action.label
            ? 'ps-8'
            : 'bg-accent text-accent-foreground',
        ]"
        @click="action.action"
      >
        <Check v-if="payment.id === action.label" />
        {{ action.label }}</DropdownMenuItem
      >
    </DropdownMenuContent>
  </DropdownMenu>
</template>
