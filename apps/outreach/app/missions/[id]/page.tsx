import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  MissionGraphsCarousel,
  type Graph,
  type SpectrumSettings,
} from "./mission-graphs-carousel";

type RawGraphData = {
  link?: string;
  file?: string;
  packets?: string[];
};

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate id is a number
  const missionId = Number(id);
  if (!Number.isInteger(missionId) || missionId <= 0) {
    redirect("/missions");
  }

  const supabase = await createClient();

  // Fetch mission from view
  const { data: mission, error: missionError } = await supabase
    .from("missions_table")
    .select("*")
    .eq("id", missionId)
    .single();

  // Redirect if not found or not PUBLISHED
  if (missionError || !mission || mission.status !== "PUBLISHED") {
    redirect("/missions");
  }

  // Fetch published graphs, featured first, then by id
  const { data: rawGraphs } = await supabase
    .from("graphs")
    .select("*")
    .eq("mission", missionId)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("id", { ascending: true });

  const graphs: Graph[] = (rawGraphs ?? []).map((g) => ({
    id: g.id,
    type: g.type as "spectrum" | "custom",
    description: g.description,
    featured: g.featured,
    published: g.published,
    data: (g.data as unknown as RawGraphData) ?? {},
  }));

  // Fetch spectrum packets for this mission
  const { data: spectrumPackets } = await supabase
    .from("packets")
    .select("packet")
    .eq("mission_id", missionId)
    .eq("type", "SPECTRUM");

  // Fetch mission settings (for spectrum threshold values)
  const { data: missionDetails } = await supabase
    .from("missions")
    .select("settings")
    .eq("id", missionId)
    .single();

  let settingsData: {
    min_voltage: number;
    max_voltage: number;
    resolution: number;
  } | null = null;

  if (missionDetails?.settings) {
    const { data } = await supabase
      .from("mission_settings")
      .select("min_voltage, max_voltage, resolution")
      .eq("id", missionDetails.settings)
      .single();
    settingsData = data;
  }

  const spectrumSettings: SpectrumSettings = {
    packets: (spectrumPackets ?? [])
      .map((p) => p.packet)
      .filter((p): p is string => p !== null),
    min_threshold: settingsData?.min_voltage ?? 0,
    max_threshold: settingsData?.max_voltage ?? 0,
    resolution: settingsData?.resolution ?? 1,
  };

  const formattedDate = mission.execution_time
    ? new Date(mission.execution_time).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl mb-2">
          {mission.name ?? "Névtelen mérés"}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          {mission.device && <span>{mission.device}</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      </div>

      <MissionGraphsCarousel
        graphs={graphs}
        spectrumSettings={spectrumSettings}
      />
    </div>
  );
}
