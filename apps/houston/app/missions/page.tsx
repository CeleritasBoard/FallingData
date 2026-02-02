"use client";

import DatabaseTable, {
    build_options,
    UserCell,
    UserCellInput,
} from "../../components/db-table";
import { Tables, Constants } from "@repo/supabase/database.types.ts";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "../../../../packages/ui/src/components/button.tsx";



const columns: ColumnDef<Tables<"missions_table">>[] = [
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
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: {
            filterVariant: "text",
        },
    },
    {
        accessorKey: "execution_time",
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
            return <span>{row.original.execution_time}</span>;
        },
        meta: {
            filterVariant: "dateRange",
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: {
            filterVariant: "selectEnum",
            filterOptions: build_options(
                Constants.public.Enums.commandtype as unknown as string[],
            ),
        },
    },
    {
        id: "user",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Felhasználó
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            console.log(row.original);
            return <UserCell metadata={row.original.meta as UserCellInput} />;
        },
    },
    {
        id: "link",
        header: ({}) => ``,
        cell: ({ row }) => {
            return (
                <Link href={`/missions/${row.original.id}`}>
                    <ExternalLink />
                </Link>
            );
        },
    },
];

export default function CommandTable() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-bold tracking-tight text-foreground">
                    Küldetések
                </h1>
            </div>
            <DatabaseTable columns={columns} table="missions_table" />
        </div>
    );
}
