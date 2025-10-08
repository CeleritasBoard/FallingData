import {Database} from "../../../supabase/database.types";
import {createClient} from "../lib/supabase/client";
export const supabase = await createClient();

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {columns} from "@/app/packets/columns";
import {DataTable} from "@workspace/ui/src/components/data-table";
import { AppSidebar } from "../components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@workspace/ui/src/components/sidebar.tsx"
import { Separator } from "@workspace/ui/src/components/separator.tsx"
import {ArrowRight} from "lucide-react";
import Link from "next/link";
        

type Packet = Database['public']['Tables']['packets']['Row'];


async function getPackets():Promise<Packet[]>{
    const{data: packets, error} = await supabase.from('packets').select('*');
    if(error){
        console.error("Error fetching packets");
        return []
    }
    return packets || [];
}

export default async function Home() {
    const appearPackets:Packet[] = await getPackets();
    return(
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
                        <h1 className="text-5xl font-bold tracking-tight text-foreground">Packetek</h1>
                        <Link
                            href="/import"
                            className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"

                        >
                            Packetek importálása
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <DataTable columns={columns} data={appearPackets}/>
                </div>
            </SidebarInset>
        </SidebarProvider>

    </div>);
}