"use client"

import {ColumnDef} from "@tanstack/react-table"
import {MoreHorizontal} from "lucide-react"
import {ArrowUpDown} from "lucide-react"
import {ChevronDown} from "lucide-react";

import {Button} from "../../../../packages/ui/src/components/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../../packages/ui/src/components/dropdown-menu.tsx"
import {useState} from "react";
import {formatDebugAddress} from "next/dist/server/lib/utils";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Packet = {
    id: string;
    type: "WELCOME" | "FLASH_DUMP" | "HEADER" | "SPECTRUM" | "SELFTEST" | "STATUS_REPORT" |
        "ERROR" | "GEIGER_COUNT";
    date: Date;
    device: "BME_HUNITY" | "ONIONSAT_TEST" | "SLOTH";
    packet: string;
    isOkaying: "YES" | "NO";
}

export const columns: ColumnDef<Packet>[] = [
    {
        accessorKey: 'id',
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    id
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
    },
    {

        accessorKey: "type",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => {
            const [selectedType, setSelectedType] = useState(row.original.type);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <span>{selectedType}</span>
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Type</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedType("WELCOME")}>WELCOME</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("FLASH_DUMP")}>FLASH_DUMP</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("HEADER")}>HEADER</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("SPECTRUM")}>SPECTRUM</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("SELFTEST")}>SELFTEST</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("STATUS_REPORT")}>STATUS_REPORT</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("ERROR")}>ERROR</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedType("GEIGER_COUNT")}>GEIGER_COUNT</DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        meta: {
            filterVariant: 'selectType'
        }
    },

    {
        accessorKey: "date",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => {

            return (
                <span>{row.original.date.toString()}</span>
            )
        },
        meta: {
            filterVariant: 'text',
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
            )
        },
        cell: ({row}) => {

            const [selectedDevice, setSelectedDevice] = useState(row.original.device);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>

                        <div className="flex items-center space-x-2 cursor-pointer">
                            <span>{selectedDevice}</span>
                            <ChevronDown className="h-4 w-4" />
                        </div>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Device</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedDevice("BME_HUNITY")}>BME_HUNITY</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedDevice("ONIONSAT_TEST")}>ONIONSAT_TEST</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedDevice("SLOTH")}>SLOTH</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        meta: {
            filterVariant: 'selectDevice',
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
            )
        },
        meta: {
            filterVariant: 'text',
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
                    is okaying
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({row}) => {
            const [selectedVal, setSelectedVal] = useState(row.original.isOkaying);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>

                        <div className="flex items-center space-x-2 cursor-pointer">
                            <span>{selectedVal}</span>
                            <ChevronDown className="h-4 w-4" />
                        </div>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Device</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedVal("YES")}>YES</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedVal("NO")}>NO</DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        meta: {
            filterVariant: 'selectBool',
        },
    },
]

