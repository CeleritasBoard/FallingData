"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, X, Check } from "lucide-react";

import { Button } from "../../../../packages/ui/src/components/button.tsx";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Packet = {
  id: string;
  type:
    | "WELCOME"
    | "FLASH_DUMP"
    | "HEADER"
    | "SPECTRUM"
    | "SELFTEST"
    | "STATUS_REPORT"
    | "ERROR"
    | "GEIGER_COUNT";
  date: Date;
  device: "BME_HUNITY" | "ONIONSAT_TEST" | "SLOTH";
  packet: string;
  isOkaying: boolean;
};

export const columns: ColumnDef<Packet>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    meta: {
      filterVariant: "number",
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    meta: {
      filterVariant: "selectType",
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span>{row.original.date.toLocaleString("hu-HU")}</span>;
    },
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "device",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    meta: {
      filterVariant: "selectDevice",
    },
  },
  {
    accessorKey: "packet",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Packet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    meta: {
      filterVariant: "text",
    },
  },
  {
    accessorKey: "isokaying",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Is Okaying
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.original.isOkaying ? <Check /> : <X />;
    },
    meta: {
      filterVariant: "selectBool",
    },
    filterFn: (row, id, value) => {
      return (
        (value === "YES" && row.original.isOkaying) ||
        (value === "NO" && !row.original.isOkaying)
      );
    },
  },
];
