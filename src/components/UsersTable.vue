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
import { ArrowUpDown, ChevronDown, Eye, Pencil } from "lucide-vue-next";

import { h, ref, computed } from "vue";
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
import type { User } from "~/types/user";
import type { Pagination as PaginationType } from "~/types/pagination";
import { useRouter } from "vue-router";

interface Props {
  data: User[];
  pagination: PaginationType;
  loading?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return h("div", { class: "flex items-center gap-2" }, [
        user.avatar
          ? h("img", {
              src: user.avatar,
              alt: user.name,
              class: "w-8 h-8 rounded-full object-cover",
            })
          : h(
              "div",
              {
                class:
                  "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold",
              },
              user.name.charAt(0).toUpperCase()
            ),
        h("span", { class: "font-medium" }, user.name),
      ]);
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return h("div", { class: "text-sm" }, row.getValue("email"));
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return h(
        "div",
        { class: "text-sm text-muted-foreground" },
        phone || "N/A"
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColors = {
        admin: "bg-red-500/10 text-red-500 border-red-500/20",
        manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        user: "bg-green-500/10 text-green-500 border-green-500/20",
        customer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      };
      return h(
        "div",
        {
          class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
            roleColors[role as keyof typeof roleColors] ||
            "bg-gray-500/10 text-gray-500 border-gray-500/20"
          }`,
        },
        role
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        active: "bg-green-500/10 text-green-500 border-green-500/20",
        inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      };
      return h(
        "div",
        {
          class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
            statusColors[status as keyof typeof statusColors] ||
            "bg-gray-500/10 text-gray-500 border-gray-500/20"
          }`,
        },
        status
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return h("div", { class: "flex gap-2" }, [
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => router.push(`/users/${user._id}`),
          },
          () => [h(Eye, { class: "h-4 w-4" })]
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => router.push(`/users/${user._id}/edit`),
          },
          () => [h(Pencil, { class: "h-4 w-4" })]
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

const searchType = ref<"name" | "email">("name");
const searchValue = ref("");

const handleSearchChange = (value: string) => {
  searchValue.value = value;
  table.getColumn("name")?.setFilterValue(undefined);
  table.getColumn("email")?.setFilterValue(undefined);

  if (value) {
    if (searchType.value === "name") {
      table.getColumn("name")?.setFilterValue(value);
    } else if (searchType.value === "email") {
      table.getColumn("email")?.setFilterValue(value);
    }
  }
};

const handleSearchTypeChange = (type: "name" | "email") => {
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
              {{ searchType === "name" ? "Name" : "Email" }}
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          class="flex-1"
          :placeholder="`Filter by ${
            searchType === 'name' ? 'name' : 'email'
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
              Delete Selected Users
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
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
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
