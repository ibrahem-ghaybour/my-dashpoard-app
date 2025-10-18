<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table"
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import { ArrowUpDown, ChevronDown } from "lucide-vue-next"

import { h, ref, computed as comp } from "vue"
import { valueUpdater } from "@/components/ui/table/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PaginationComponent from "~/components/Pagination.vue"
import DropdownAction from "~/components/section/DataTableDemoColumn.vue"
import type { OrderData } from "~/types/orders"
import type { Pagination as PaginationType } from "~/types/pagination"
import { computed } from "vue"

interface Props {
  data: OrderData[]
  pagination: PaginationType
  loading?: boolean
}

const props = defineProps<Props>()

const columns: ColumnDef<OrderData>[] = [
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
      "ariaLabel": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": value => row.toggleSelected(!!value),
      "ariaLabel": "Select row",
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderCode",
    header: "Order Code",
    cell: ({ row }) => h("div", { class: "font-mono text-sm font-medium" }, row.getValue("orderCode")),
  },
  {
    accessorKey: "user.name",
    id: "userName",
    header: ({ column }) => {
      return h(Button, {
        variant: "ghost",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }, () => ["User Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })])
    },
    cell: ({ row }) => {
      const user = row.original.user
      return h("div", { class: "font-medium text-sm" }, user.name)
    },
  },
  {
    accessorKey: "user.email",
    id: "userEmail",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original.user
      return h("div", { class: "text-sm text-muted-foreground" }, user.email)
    },
  },
  {
    accessorKey: "user.role",
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original.user
      const roleColors = {
        admin: "bg-red-500/10 text-red-500 border-red-500/20",
        manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        user: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      }
      return h("div", { 
        class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${roleColors[user.role as keyof typeof roleColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`
      }, user.role)
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => h("div", { class: "text-right" }, "Total Amount"),
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number
      const currency = row.original.currency

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount)

      return h("div", { class: "text-right font-medium" }, formatted)
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusColors = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        delivered: "bg-green-500/10 text-green-500 border-green-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      }
      return h("div", { 
        class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[status as keyof typeof statusColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`
      }, status)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return h("div", { class: "relative" }, h(DropdownAction, {
        payment: { id: payment._id },
        actions: [
          {
            label: "Copy Order ID",
            action: () => navigator.clipboard.writeText(payment._id),
          },
          {
            label: "View Details",
            action: () => row.toggleExpanded(),
          },
        ],
      }))
    },
  },
]

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const table = useVueTable({
  get data() { return props.data },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualPagination: true,
  pageCount: computed(() => props.pagination.pages).value,
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
  },
})

const currentPage = computed(() => props.pagination.page)
const totalPages = computed(() => props.pagination.pages)
const pageSize = computed(() => props.pagination.limit)
const totalItems = computed(() => props.pagination.total)
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center py-4">
      <Input class="max-w-sm" placeholder="Filter by user name..."
        :model-value="table.getColumn('userName')?.getFilterValue() as string"
        @update:model-value=" table.getColumn('userName')?.setFilterValue($event)" />
      
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
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
          <DropdownMenuCheckboxItem v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id" class="capitalize" :model-value="column.getIsVisible()" @update:model-value="(value) => {
              column.toggleVisibility(!!value)
            }">
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border relative">
      <div v-if="loading" class="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
        <div class="flex flex-col items-center gap-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()" class="bg-muted/50">
                <TableCell :colspan="row.getAllCells().length" class="p-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 class="font-semibold mb-2">Order Details</h4>
                      <div class="space-y-1 text-muted-foreground">
                        <p><span class="font-medium text-foreground">Order ID:</span> {{ row.original._id }}</p>
                        <p><span class="font-medium text-foreground">Currency:</span> {{ row.original.currency }}</p>
                        <p><span class="font-medium text-foreground">Created:</span> {{ new Date(row.original.createdAt).toLocaleString() }}</p>
                        <p v-if="row.original.notes"><span class="font-medium text-foreground">Notes:</span> {{ row.original.notes }}</p>
                      </div>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-2">Shipping Address</h4>
                      <div class="space-y-1 text-muted-foreground">
                        <p class="font-medium text-foreground">{{ row.original.shippingAddress.fullName }}</p>
                        <p>{{ row.original.shippingAddress.phone }}</p>
                        <p>{{ row.original.shippingAddress.line1 }}</p>
                        <p v-if="row.original.shippingAddress.line2">{{ row.original.shippingAddress.line2 }}</p>
                        <p>{{ row.original.shippingAddress.city }}, {{ row.original.shippingAddress.governorate }}</p>
                        <p>{{ row.original.shippingAddress.postalCode }}, {{ row.original.shippingAddress.country }}</p>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <h4 class="font-semibold mb-2">Order Items ({{ row.original.items.length }})</h4>
                      <div class="space-y-2">
                        <div v-for="item in row.original.items" :key="item.product._id" class="flex justify-between items-center p-2 bg-background rounded border">
                          <div>
                            <p class="font-medium">{{ item.name }}</p>
                            <p class="text-xs text-muted-foreground">Quantity: {{ item.quantity }} × {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(item.price) }}</p>
                          </div>
                          <p class="font-medium">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(item.subtotal) }}</p>
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

    <div class="flex flex-col  items-center justify-between py-4">
      <div class="text-sm me-auto text-muted-foreground">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} results
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
