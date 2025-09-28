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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <DataTable columns={columns} data={appearPackets}/>
                </div>
            </SidebarInset>
        </SidebarProvider>

    </div>);
}