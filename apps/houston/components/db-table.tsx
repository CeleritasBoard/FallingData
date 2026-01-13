"use client";

import {
  ColumnFiltersState,
  SortingState,
  ColumnDef,
  AccessorKeyColumnDef,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { DataTable } from "@workspace/ui/src/components/data-table";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import {
  ClientServerOptions,
  GenericSchema,
} from "@supabase/supabase-js/dist/module/lib/rest/types/common/common";
import { CircleUserRound } from "lucide-react";

export interface DatabaseTableProps<T> {
  // Define your props here
  table: string;
  columns: ColumnDef<T>[];
  query_fields?: string;
}

export function build_options(options: string[]): Record<string, string> {
  return Object.fromEntries(options.map((item) => [item, item]));
}

function build_query<
  T,
  Q extends PostgrestFilterBuilder<
    any,
    any,
    any,
    any[],
    string,
    unknown,
    "GET"
  >,
>(
  query: Q,
  sorting: SortingState,
  columns: ColumnDef<T>[],
  filters: ColumnFiltersState,
): Q {
  if (sorting.length > 0)
    query = query.order(sorting[0].id, {
      ascending: sorting[0].desc,
    });

  if (filters.length > 0) {
    for (const filter of filters) {
      const columnDef = columns.find(
        (col) => (col as AccessorKeyColumnDef<T>).accessorKey === filter.id,
      )!;
      const filterType = columnDef!.meta!.filterVariant;
      if (
        filterType === "selectDevice" ||
        filterType === "selectEnum" ||
        filterType === "number"
      ) {
        query = query.eq(filter.id, filter.value);
      } else if (filterType === "selectBool") {
        query = query.eq(filter.id, filter.value === "YES");
      } else if (filterType === "dateRange") {
        const filterValue = filter.value as number[];
        if (filterValue[0] == 0 || filterValue[1] == 0) continue;
        query = query
          .lte(filter.id, filterValue[1])
          .gte(filter.id, filterValue[0]);
      } else {
        query = query.like(filter.id, `%${filter.value}%`);
      }
    }
  }
  return query;
}

export default function DatabaseTable<T>({
  table,
  columns,
  query_fields,
}: DatabaseTableProps<T>) {
  const supabase = createClient();

  const [data, setData] = useState<T[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 50,
  });
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const data_query = supabase.from(table).select(query_fields ?? "*");
    build_query(data_query, sorting, columns, filters);
    data_query
      .range(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize - 1,
      )
      .then(({ data }) => {
        setData(data ?? []);
      });
  }, [sorting, filters, pagination]);

  useEffect(() => {
    const query = supabase
      .from(table)
      .select(query_fields ?? "*", { count: "exact" });
    build_query(query, sorting, columns, filters);
    query.then(({ count }) => {
      setRowCount(count!);
    });
  }, [filters]);

  return (
    <DataTable
      columns={columns}
      data={data}
      onColumnFiltersChange={setFilters}
      onSortingChange={setSorting}
      onPaginationChange={(e) => {
        setPagination({ ...pagination, pageIndex: e.pageIndex });
      }}
      pagination={{ pageIndex: 0, pageSize: 50 }}
      rowCount={rowCount ?? 0}
    />
  );
}

export type UserCellInput = { email: string; name?: string; picture?: string };

export function UserCell({ metadata }: { metadata: UserCellInput }) {
  return (
    <div className="flex flex-row gap-2">
      {!metadata.picture ? (
        <CircleUserRound />
      ) : (
        <img src={metadata.picture!} className="w-6 h-6 rounded-lg" />
      )}
      <span className="align-middle">
        {metadata.name ?? metadata.email}{" "}
      </span>{" "}
    </div>
  );
}
