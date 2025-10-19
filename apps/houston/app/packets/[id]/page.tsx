import { createClient } from "@/lib/supabase/server";
import {
  Database,
  Tables,
  Json,
  Enums,
} from "@repo/supabase/database.types.ts";
import { AppSidebar } from "../../../components/app-sidebar";
import Device from "../../../components/device";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/src/components/sidebar.tsx";
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
    <div>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset />
        <div className="flex flex-col">
          <h1>Packet Details</h1>
          <p>ID: {JSON.stringify(packet)}</p>
          <ParamsTable
            params={formatPacketDetailTable(packet.type, packet.details)}
          />
          <Device device={packet.device} />
        </div>
      </SidebarProvider>
    </div>
  );
}
