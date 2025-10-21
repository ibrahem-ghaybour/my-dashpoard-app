<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Props {
  currentPage: number
  totalPages: number
  total: number
  itemsPerPage: number
  hasPrev: boolean
  hasNext: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <Pagination 
    :items-per-page="itemsPerPage" 
    :total="total" 
    :page="currentPage"
    :sibling-count="1"
    show-edges
    @update:page="(newPage: number) => emit('update:page', newPage)"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationFirst @click="emit('update:page', 1)" :disabled="!hasPrev" />
      <PaginationPrevious @click="emit('update:page', currentPage - 1)" :disabled="!hasPrev" />

      <template v-for="(item, index) in items" :key="index">
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === currentPage"
          size="default"
          @click="emit('update:page', item.value)"
        >
          {{ item.value }}
        </PaginationItem>
        <PaginationEllipsis v-else :index="index" />
      </template>

      <PaginationNext @click="emit('update:page', currentPage + 1)" :disabled="!hasNext" />
      <PaginationLast @click="emit('update:page', totalPages)" :disabled="!hasNext" />
    </PaginationContent>
  </Pagination>
</template>