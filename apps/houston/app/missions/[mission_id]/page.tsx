import { createClient } from "@/lib/supabase/server.ts";
import { AlapadatokCard } from "@/app/missions/[mission_id]/mission_components/AlapAdatokCard.tsx";
import { BeallitasokCard } from "@/app/missions/[mission_id]/mission_components/BeallitasokCard.tsx";
import {
  ParancsokCard,
  type ParancsItem,
} from "@/app/missions/[mission_id]/mission_components/parancsokCard.tsx";
import {
  PacketekCard,
  type PacketItem,
} from "@/app/missions/[mission_id]/mission_components/packetek-card.tsx";
import {
  parse_packet,
  formatPacketDetailTable,
} from "@workspace/device-comm/src/packet_parser.ts";
import { MetaadatokCard } from "@/app/missions/[mission_id]/mission_components/metaadatok-card.tsx";
import Device from "@/components/device";
import { SpectrumCard } from "@/app/missions/[mission_id]/mission_components/spectrum-card.tsx";
import { AbortedState } from "./mission_components/abortedState.tsx";
import { ManualLinkBanner } from "./mission_components/manual-link-banner.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/src/components/card.tsx";

export default async function missionDataPage({
  params,
}: {
  params: Promise<{ mission_id: string }>;
}) {
  const { mission_id } = await params;
  const supabase = await createClient();

  const { data: viewData } = await supabase
    .from("missions_table")
    .select("*")
    .eq("id", mission_id)
    .single();
  console.log(viewData);
  const { data: details } = await supabase
    .from("missions")
    .select("*")
    .eq("id", mission_id)
    .single();

  const { data: settings } = await supabase
    .from("mission_settings")
    .select("*")
    .eq("id", mission_id)
    .single();

  const { data: commands } = (await supabase
    .from("commands")
    .select("id, type, command")
    .eq("mission_id", mission_id)) as { data: ParancsItem[] | null };

  const { data: packets } = (await supabase
    .from("packets")
    .select("id, type, packet")
    .eq("mission_id", mission_id)) as { data: PacketItem[] | null };

  const { data: spectrumPackets } = (await supabase
    .from("packets")
    .select("id, type, packet")
    .eq("mission_id", mission_id)
    .eq("type", "SPECTRUM")) as { data: PacketItem[] | null };

  const { data: headerPacket } = await supabase
    .from("packets")
    .select("id, type, packet, details")
    .eq("mission_id", mission_id)
    .eq("type", "HEADER")
    .single();

  const isCreatedStatus = viewData.status == "CREATED";
  const isAbortedStatus = viewData.status == "ABORTED";

  const { packet_type, data } = parse_packet(
    headerPacket?.packet ?? "00000000000000000000000000000000",
  );

  const headerData = formatPacketDetailTable(packet_type, data ?? undefined);

  const alapAdatok = {
    nev: viewData?.name,
    status: viewData?.status,
    letrehozo: viewData?.meta?.name,
    avatar: viewData?.meta?.avatar_url,
    exec_time: viewData?.execution_time,
  };

  const beallitasok = [
    { nev: "Típus", ertek: settings?.type },
    { nev: "Mérési tart. minimum  (mV)", ertek: settings?.min_voltage },
    { nev: "Mérési tart. maximum (mV)", ertek: settings?.max_voltage },
    { nev: "Sampling", ertek: settings?.samples },
    { nev: "Felbontás (csatorna)", ertek: settings?.resolution },
    { nev: "Időtartam (beütés)", ertek: settings?.duration },
    { nev: "Okézás", ertek: settings?.is_okay == 1 },
    { nev: "Fejléc packet", ertek: settings?.is_header == 1 },
    {
      nev: "Folytat ha megtelik?",
      ertek: settings?.continue_with_full_channel == 1,
    },
  ];

  const spectrum: string[] = (spectrumPackets || []).map((p) => p.packet);

  return (
    <main className="min-h-screen bg-background p-6 lg:p-10">
      {/* Page title */}
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
        Küldetés adatai
      </h1>

      {/* Top row: Alapadatok */}
      <div className="mb-6">
        <AlapadatokCard data={alapAdatok} mission_id={mission_id} />
      </div>

      <div className="mb-6 flex flex-col justify-start lg:flex-row gap-6 h-[380px]">
        <Card className="min-h-[380px] h-full">
          <CardHeader>
            <CardTitle>Eszköz</CardTitle>
          </CardHeader>
          <CardContent>
            <Device device={details?.device} />
          </CardContent>
        </Card>
        <BeallitasokCard
          data={beallitasok}
          createdStatus={isCreatedStatus}
          mission_id={mission_id}
          initialState={settings}
        />
        <ParancsokCard data={commands} />
      </div>
      <ManualLinkBanner
        missionId={mission_id}
        device={details?.device}
        missionStatus={viewData?.status}
        executionTime={viewData?.execution_time}
      />

      {/* Bottom row: Packetek, Metaadatok, Spektrum */}
      {(viewData?.status === "PROCESSING" ||
        viewData?.status === "PUBLISHED") && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <PacketekCard data={packets} />
          <MetaadatokCard data={headerData} />
          <SpectrumCard
            data={{
              packets: spectrum,
              min_threshold: settings?.min_voltage,
              max_threshold: settings?.max_voltage,
              resolution: settings?.resolution,
            }}
            missionId={mission_id}
          />
        </div>
      )}
      {isAbortedStatus && (
        <AbortedState
          username={
            viewData?.abort_meta?.full_name?.toString() ??
            viewData?.abort_meta?.email ??
            "N/A"
          }
          reason={viewData?.abortInfo?.reason ?? "N/A"}
        />
      )}
    </main>
  );
}
