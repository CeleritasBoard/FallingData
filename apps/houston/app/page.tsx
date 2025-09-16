import {Database} from "../../../supabase/database.types";
import {createClient} from "../lib/supabase/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {columns} from "@/app/packets/columns";
import {DataTable} from "@workspace/ui/src/components/data-table";
        
const supabase = await createClient();
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
        <DataTable columns={columns} data={appearPackets}/>
    </div>);
}