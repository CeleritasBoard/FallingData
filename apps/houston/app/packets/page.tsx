import { columns } from "@/app/packets/columns";
import { AppSidebar } from "../../components/app-sidebar";
import DatabaseTable from "../../components/db-table";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/src/components/sidebar.tsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PacketsTable() {
  return (
    <div>
      <SidebarProvider defaultOpen>
        <AppSidebar />

        <SidebarInset>
          {/*<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                </header>*/}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Packetek
              </h1>
              <Link
                href="/import"
                className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Packetek importálása
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <DatabaseTable columns={columns} table="packets" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
