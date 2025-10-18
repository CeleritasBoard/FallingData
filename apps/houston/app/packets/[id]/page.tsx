import { createClient } from "@/lib/supabase/server";
import {
  Database,
  Tables,
  Json,
  Enums,
} from "@repo/supabase/database.types.ts";
import { AppSidebar } from "../../../components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/src/components/sidebar.tsx";

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
        <h1>Packet Details</h1>
        <p>ID: {JSON.stringify(packet)}</p>
      </SidebarProvider>
    </div>
  );
}
