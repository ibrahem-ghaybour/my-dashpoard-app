<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ArrowUpDown, ChevronDown } from "lucide-vue-next";

import { h, ref } from "vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { CartData } from "~/types/cart";
import type { Pagination as PaginationType } from "~/types/pagination";
import { computed } from "vue";

interface Props {
  data: CartData[];
  pagination: PaginationType;
  loading?: boolean;
}

const props = defineProps<Props>();

const columns: ColumnDef<CartData>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value) =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "_id",
    header: "Cart ID",
    cell: ({ row }) =>
      h(
        "div",
        { class: "font-mono text-sm font-medium" },
        row.original._id.slice(-8).toUpperCase()
      ),
  },
  {
    accessorKey: "user.name",
    id: "userName",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["User Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const user = row.original.user;
      return h("div", { class: "font-medium text-sm" }, user.name);
    },
  },
  {
    accessorKey: "user.email",
    id: "userEmail",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original.user;
      return h("div", { class: "text-sm text-muted-foreground" }, user.email);
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const itemCount = row.original.items.length;
      return h(
        "div",
        { class: "text-sm" },
        `${itemCount} item${itemCount !== 1 ? "s" : ""}`
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => h("div", { class: "text-right" }, "Total Amount"),
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      const currency = row.original.currency;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return h(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => row.toggleExpanded(),
        },
        () => "View Details"
      );
    },
  },
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualPagination: true,
  pageCount: computed(() => props.pagination.pages).value,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
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
    get expanded() {
      return expanded.value;
    },
  },
});

const currentPage = computed(() => props.pagination.page);
const totalPages = computed(() => props.pagination.pages);
const pageSize = computed(() => props.pagination.limit);
const totalItems = computed(() => props.pagination.total);

const searchType = ref<"name" | "email" | "id">("name");
const searchValue = ref("");

const handleSearchChange = (value: string) => {
  searchValue.value = value;
  table.getColumn("userName")?.setFilterValue(undefined);
  table.getColumn("userEmail")?.setFilterValue(undefined);
  table.getColumn("_id")?.setFilterValue(undefined);

  if (value) {
    if (searchType.value === "name") {
      table.getColumn("userName")?.setFilterValue(value);
    } else if (searchType.value === "email") {
      table.getColumn("userEmail")?.setFilterValue(value);
    } else if (searchType.value === "id") {
      table.getColumn("_id")?.setFilterValue(value);
    }
  }
};

const handleSearchTypeChange = (type: "name" | "email" | "id") => {
  searchType.value = type;
  handleSearchChange(searchValue.value);
};

const handleBulkDelete = () => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original._id);
  emit("bulk-delete", selectedIds);
  table.resetRowSelection();
};

const emit = defineEmits<{
  "update:page": [page: number];
  "update:limit": [limit: number];
  "bulk-delete": [ids: string[]];
}>();
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center justify-between py-4">
      <div class="flex gap-2 items-center max-w-md">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="w-32">
              {{
                searchType === "name"
                  ? "Name"
                  : searchType === "email"
                  ? "Email"
                  : "Cart ID"
              }}
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              @click="handleSearchTypeChange('name')"
              :class="{ 'bg-accent': searchType === 'name' }"
            >
              Search by Name
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleSearchTypeChange('email')"
              :class="{ 'bg-accent': searchType === 'email' }"
            >
              Search by Email
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleSearchTypeChange('id')"
              :class="{ 'bg-accent': searchType === 'id' }"
            >
              Search by Cart ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          class="flex-1"
          :placeholder="`Filter by ${
            searchType === 'name'
              ? 'name'
              : searchType === 'email'
              ? 'email'
              : 'cart ID'
          }...`"
          :model-value="searchValue"
          @update:model-value="handleSearchChange"
        />
      </div>
      <div class="flex gap-2 items-center">
        <DropdownMenu
          v-if="table.getFilteredSelectedRowModel().rows.length > 0"
        >
          <DropdownMenuTrigger as-child>
            <Button variant="default">
              Bulk Actions ({{
                table.getFilteredSelectedRowModel().rows.length
              }})
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              @click="handleBulkDelete"
              class="text-destructive font-semibold"
            >
              Delete Selected Carts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              :class="{
                'ml-auto':
                  table.getFilteredSelectedRowModel().rows.length === 0,
              }"
            >
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
          <p class="text-sm text-muted-foreground">Loading...</p>
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
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()" class="bg-muted/50">
                <TableCell :colspan="columns.length" class="p-6">
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <h4 class="font-semibold mb-2">Cart Details</h4>
                      <div class="space-y-1 text-muted-foreground">
                        <p>
                          <span class="font-medium text-foreground"
                            >Cart ID:</span
                          >
                          {{ row.original._id }}
                        </p>
                        <p>
                          <span class="font-medium text-foreground"
                            >Currency:</span
                          >
                          {{ row.original.currency }}
                        </p>
                        <p>
                          <span class="font-medium text-foreground"
                            >Created:</span
                          >
                          {{
                            new Date(row.original.createdAt).toLocaleString()
                          }}
                        </p>
                        <p>
                          <span class="font-medium text-foreground"
                            >Last Updated:</span
                          >
                          {{
                            new Date(row.original.updatedAt).toLocaleString()
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <h4 class="font-semibold mb-2">
                        Cart Items ({{ row.original.items.length }})
                      </h4>
                      <div class="space-y-2">
                        <div
                          v-for="item in row.original.items"
                          :key="item.product._id"
                          class="flex justify-between items-center p-2 bg-background rounded border"
                        >
                          <div>
                            <p class="font-medium">{{ item.name }}</p>
                            <p class="text-xs text-muted-foreground">
                              Quantity: {{ item.quantity }} ×
                              {{
                                new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: row.original.currency,
                                }).format(item.price)
                              }}
                            </p>
                          </div>
                          <p class="font-medium">
                            {{
                              new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: row.original.currency,
                              }).format(item.subtotal)
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </template>

          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-col items-center justify-between py-4">
      <div class="text-sm me-auto text-muted-foreground">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to
        {{ Math.min(currentPage * pageSize, totalItems) }} of
        {{ totalItems }} results
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
