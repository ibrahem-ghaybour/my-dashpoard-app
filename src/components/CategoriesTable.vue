<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ArrowUpDown, ChevronDown, Tag, Eye, Pencil, Trash2 } from "lucide-vue-next";

import { h, ref, computed } from "vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationComponent from "~/components/Pagination.vue";
import type { Category } from "~/types/category";
import type { Pagination as PaginationType } from "~/types/pagination";

interface Props {
  data: Category[];
  pagination: PaginationType;
  loading?: boolean;
}

const props = defineProps<Props>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const columns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        "onUpdate:checked": (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      });
    },
    cell: ({ row }) => {
      return h(Checkbox, {
        checked: row.getIsSelected(),
        "onUpdate:checked": (value: boolean) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      });
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Category Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return h("div", { class: "flex items-center gap-2" }, [
        h(Tag, { class: "h-4 w-4 text-muted-foreground" }),
        h("span", { class: "font-medium" }, name),
      ]);
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return h("div", { class: "max-w-md truncate" }, description || "No description");
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return h(
        "div",
        {
          class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isActive
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
          }`,
        },
        isActive ? "Active" : "Inactive"
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return h("div", [
        h("div", { class: "font-medium text-sm" }, createdBy.name),
        h("div", { class: "text-xs text-muted-foreground" }, createdBy.email),
      ]);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return h("div", { class: "text-sm" }, formatDate(date));
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const category = row.original;
      return h("div", { class: "flex items-center gap-1" }, [
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("view", category._id),
          },
          () => [h(Eye, { class: "h-4 w-4" })]
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("edit", category._id),
          },
          () => [h(Pencil, { class: "h-4 w-4" })]
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("delete", category._id),
          },
          () => [h(Trash2, { class: "h-4 w-4 text-destructive" })]
        ),
      ]);
    },
  },
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  manualPagination: true,
  pageCount: computed(() => props.pagination.pages).value,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
});

const currentPage = computed(() => props.pagination.page);
const totalPages = computed(() => props.pagination.pages);
const pageSize = computed(() => props.pagination.limit);
const totalItems = computed(() => props.pagination.total);

const emit = defineEmits<{
  "update:page": [page: number];
  "update:limit": [limit: number];
  view: [id: string];
  edit: [id: string];
  delete: [id: string];
  bulkDelete: [ids: string[]];
}>();

const selectedCategoryIds = computed(() => {
  return table.getFilteredSelectedRowModel().rows.map((row) => row.original._id);
});

const handleBulkDelete = () => {
  if (selectedCategoryIds.value.length > 0) {
    emit("bulkDelete", selectedCategoryIds.value);
  }
};
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center justify-between py-4">
      <div class="flex gap-2 items-center flex-1">
        <Input
          class="max-w-sm"
          placeholder="Filter by category name..."
          :model-value="(table.getColumn('name')?.getFilterValue() as string) ?? ''"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
        />
        <Button
          v-if="selectedCategoryIds.length > 0"
          variant="destructive"
          size="sm"
          @click="handleBulkDelete"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete {{ selectedCategoryIds.length }} selected
        </Button>
      </div>
      <div class="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              {{ pageSize }} per page
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="limit in [10, 20, 30, 50, 100]"
              :key="limit"
              @click="$emit('update:limit', limit)"
              :class="{ 'bg-accent': pageSize === limit }"
            >
              {{ limit }} per page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              Columns
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table
                .getAllColumns()
                .filter((column) => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="
                (value) => {
                  column.toggleVisibility(!!value);
                }
              "
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <div class="rounded-md border relative">
      <div
        v-if="loading"
        class="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          ></div>
          <p class="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No categories found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-col items-center justify-between py-4">
      <div class="text-sm me-auto text-muted-foreground">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to
        {{ Math.min(currentPage * pageSize, totalItems) }} of
        {{ totalItems }} categories
      </div>
      <PaginationComponent
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="totalItems"
        :items-per-page="pageSize"
        :has-prev="pagination.hasPrev"
        :has-next="pagination.hasNext"
        @update:page="(newPage: number) => $emit('update:page', newPage)"
      />
    </div>
  </div>
</template>
