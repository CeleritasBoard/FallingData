"use client";

import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { DataTable } from "@workspace/ui/src/components/data-table";

export interface DatabaseTableProps<T> {
  // Define your props here
  table: string;
  columns: ColumnDef<T>[];
}

export default function DatabaseTable<T>({
  table,
  columns,
}: DatabaseTableProps<T>) {
  const supabase = createClient();

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    let query = supabase.from(table).select("*");

    if (sorting.length > 0)
      query = query.order(sorting[0].id, { ascending: sorting[0].desc });

    if (filters.length > 0) {
      for (const filter of filters) {
        let columnDef = columns.find((col) => col.accessorKey === filter.id);
        let filterType = columnDef.meta.filterVariant;
        if (
          filterType === "selectDevice" ||
          filterType === "selectType" ||
          filterType === "number"
        ) {
          query = query.eq(filter.id, filter.value);
        } else if (filterType === "selectBool") {
          query = query.eq(filter.id, filter.value === "YES");
        } else {
          query = query.like(filter.id, `%${filter.value}%`);
        }
      }
    }
    query.then(({ data }) => {
      setData(data);
    });
  }, [sorting, filters]);

  return (
    <DataTable
      columns={columns}
      data={data}
      onColumnFiltersChange={setFilters}
      onSortingChange={setSorting}
    />
  );
}
