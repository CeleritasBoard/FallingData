"use client";
import * as React from "react";
import { useEffect } from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.tsx";
import { Button } from "./button.tsx";
import { on } from "node:stream";

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?:
      | "text"
      | "range"
      | "selectEnum"
      | "selectDevice"
      | "selectBool"
      | "number"
      | "dateRange";
    filterOptions?: Record<string, string>;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  pagination?: PaginationState | null;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowCount?: number | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSortingChange = () => {},
  onColumnFiltersChange = () => {},
  pagination = null,
  onPaginationChange = () => {},
  rowCount = null,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    { pageIndex: 0, pageSize: 10 },
  );

  useEffect(() => {
    onSortingChange(sorting);
  }, [sorting]);

  useEffect(() => {
    onColumnFiltersChange(columnFilters);
  }, [columnFilters]);

  useEffect(() => {
    onPaginationChange(paginationState);
  }, [paginationState]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPaginationState,
    rowCount: rowCount ?? undefined,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      pagination: paginationState,
    },
    initialState: {
      pagination: pagination ?? undefined,
    },
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} />
                        </div>
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <p>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}{" "}
          pages
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" || filterVariant === "dateRange" ? (
    <div>
      <div className="flex flex-col space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type={filterVariant === "dateRange" ? "datetime-local" : "number"}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="border shadow rounded"
        />
        <DebouncedInput
          type={filterVariant === "dateRange" ? "datetime-local" : "number"}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "selectBool" ? (
    <select
      onChange={(e) => {
        column.setFilterValue(e.target.value);
      }}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="YES">YES</option>
      <option value="NO">NO</option>
    </select>
  ) : filterVariant === "selectEnum" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      {Object.entries(column.columnDef.meta?.filterOptions ?? {}).map(
        (option) => {
          return (
            <option key={option[0]} value={option[0] as string}>
              {option[1]}
            </option>
          );
        },
      )}
    </select>
  ) : filterVariant === "selectDevice" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="BME_HUNITY">BME_HUNITY</option>
      <option value="ONIONSAT_TEST">ONIONSAT_TEST</option>
      <option value="SLOTH">SLOTH</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
