import {Database} from "../../../supabase/database.types";
import {createClient} from "../lib/supabase/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
        
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
    const appearPackets = await getPackets();

    return(
    <div>
        <h2>Welcome to Houston!</h2>
        <table>
            <thead>
                <tr>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Device</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Packet</th>
                    
                </tr>
            </thead>
            <tbody>
                {appearPackets.map((p:Packet) => (
                    <tr key={p.id}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}> {p.id}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.type}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.date}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.device}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.packet}</td>
                        
                    </tr>
                ))}
            </tbody>
        </table>
        
        <Alert variant="destructive">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    </div>);
}