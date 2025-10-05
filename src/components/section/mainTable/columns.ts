import type { ColumnDef } from "@tanstack/vue-table";
import { h } from "vue";

// define your row type
export type RowData = {
  amount: number | string;
};

export const columns: ColumnDef<RowData>[] = [
  {
    accessorKey: "amount",
    header: () => h("div", { class: "text-right" }, "Amount"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
    },
  },
];
