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

const formatMissionDateTime = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const lookup = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  if (!lookup.year || !lookup.month || !lookup.day) return null;
  if (!lookup.hour || !lookup.minute || !lookup.second) return null;
  return `${lookup.year}.${lookup.month}.${lookup.day}. ${lookup.hour}:${lookup.minute}:${lookup.second}`;
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

  // Fetch graphs, featured first, then by id
  const { data: rawGraphs } = await supabase
    .from("graphs")
    .select("*")
    .eq("mission", missionId)
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

  const formattedDateTime = formatMissionDateTime(mission.execution_time);

  return (
    <div className="dark flex-1 bg-[#111111] text-white">
      <section className="px-6 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-[1200px] py-16 text-center">
          <h1 className="text-[40px] leading-tight font-semibold tracking-tight lg:text-[56px]">
            {mission.name ?? "Névtelen mérés"}
          </h1>
          <div className="mt-4 text-lg text-white/80">Dátum:</div>
          <div className="mt-1 text-2xl font-medium text-white/90">
            {formattedDateTime ?? "Ismeretlen dátum"}
          </div>
        </div>
      </section>

      <section className="bg-[#1b1b1b]">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-12 py-10">
          <MissionGraphsCarousel
            graphs={graphs}
            spectrumSettings={spectrumSettings}
          />
        </div>
      </section>
    </div>
  );
}
