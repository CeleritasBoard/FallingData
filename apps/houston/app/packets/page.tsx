import { columns } from "@/app/packets/columns";
import DatabaseTable from "../../components/db-table";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PacketsTable() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Packetek
        </h1>
        <Link
          href="/packets/import"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Packetek importálása
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <DatabaseTable columns={columns} table="packets" />
    </div>
  );
}
