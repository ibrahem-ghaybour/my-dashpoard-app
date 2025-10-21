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
import { ArrowUpDown, ChevronDown, Package, TrendingUp, Pencil, Trash2, Eye } from "lucide-vue-next";

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
import type { ProductFromOrder } from "~/composable/useProducts";
import type { Pagination as PaginationType } from "~/types/pagination";

interface Props {
  data: ProductFromOrder[];
  pagination: PaginationType;
  loading?: boolean;
}

const props = defineProps<Props>();

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// const selectedRows = ref<Record<string, boolean>>({});

const columns: ColumnDef<ProductFromOrder>[] = [
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
        () => ["Product Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return h("div", { class: "flex items-center gap-2" }, [
        h(Package, { class: "h-4 w-4 text-muted-foreground" }),
        h("span", { class: "font-medium" }, name),
      ]);
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Unit Price", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const currency = row.original.currency;
      return h("div", { class: "font-medium" }, formatPrice(price, currency));
    },
  },
  {
    accessorKey: "totalQuantity",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Total Sold", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const quantity = row.getValue("totalQuantity") as number;
      return h("div", { class: "text-center font-semibold" }, quantity.toLocaleString());
    },
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Orders", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("orderCount") as number;
      return h("div", { class: "text-center" }, count);
    },
  },
  {
    accessorKey: "totalRevenue",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Total Revenue", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const revenue = row.getValue("totalRevenue") as number;
      const currency = row.original.currency;
      return h("div", { class: "flex items-center gap-2 font-bold text-green-600" }, [
        h(TrendingUp, { class: "h-4 w-4" }),
        h("span", formatPrice(revenue, currency)),
      ]);
    },
  },
  {
    accessorKey: "lastOrderDate",
    header: "Last Order",
    cell: ({ row }) => {
      const date = row.getValue("lastOrderDate") as string;
      return h("div", { class: "text-sm text-muted-foreground" }, formatDate(date));
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return h("div", { class: "flex items-center gap-1" }, [
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("view", product._id),
          },
          () => [h(Eye, { class: "h-4 w-4" })]
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("edit", product._id),
          },
          () => [h(Pencil, { class: "h-4 w-4" })]
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => emit("delete", product._id),
          },
          () => [h(Trash2, { class: "h-4 w-4 text-destructive" })]
        ),
      ]);
    },
  },
];

const sorting = ref<SortingState>([{ id: "totalRevenue", desc: true }]);
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

const selectedProductIds = computed(() => {
  return table.getFilteredSelectedRowModel().rows.map((row) => row.original._id);
});

const handleBulkDelete = () => {
  if (selectedProductIds.value.length > 0) {
    emit("bulkDelete", selectedProductIds.value);
  }
};
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center justify-between py-4">
      <div class="flex gap-2 items-center flex-1">
        <Input
          class="max-w-sm"
          placeholder="Filter by product name..."
          :model-value="(table.getColumn('name')?.getFilterValue() as string) ?? ''"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
        />
        <Button
          v-if="selectedProductIds.length > 0"
          variant="destructive"
          size="sm"
          @click="handleBulkDelete"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete {{ selectedProductIds.length }} selected
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
          <p class="text-sm text-muted-foreground">Loading products...</p>
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
              No products found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-col items-center justify-between py-4">
      <div class="text-sm me-auto text-muted-foreground">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to
        {{ Math.min(currentPage * pageSize, totalItems) }} of
        {{ totalItems }} products
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
