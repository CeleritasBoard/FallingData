import { createClient } from "@/lib/supabase/server";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/src/components/card";
import Device from "../../../components/device";
import { ParamsTable } from "@workspace/ui/src/components/params-table.tsx";
import { formatPacketDetailTable } from "../../../../../packages/device-comm/src/packet_parser";
export default async function PacketDetailsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: packet } = await supabase
    .from("packets")
    .select("*")
    .eq("id", id)
    .single();
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Packet adatai</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alapadatok Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Alapadatok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Packet:</p>
              <p className="text-sm font-mono break-all">{packet.packet}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Típus:</p>
              <p className="text-sm">{packet.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dátum:</p>
              <p className="text-sm">{packet.date}</p>
            </div>
          </CardContent>
        </Card>

        {/* Eszköz Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Eszköz</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <Device device={packet.device} />
          </CardContent>
        </Card>

        {/* Paraméterek Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Paraméterek</CardTitle>
          </CardHeader>
          <CardContent>
            <ParamsTable
              params={formatPacketDetailTable(packet.type, packet.details)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
