import { createClient } from "@/lib/supabase/server";
import Spectrum, { Input } from "@workspace/ui/src/components/Spectrum";
import SpectrumPreview from "@workspace/ui/src/components/spectrum-preview";
import { ExternalLink } from "lucide-react";

interface GraphData {
  id: number;
  type: "spectrum" | "custom";
  description: string | null;
  data: {
    link?: string;
    file?: string;
    packets?: number[];
  };
  spectrumData: Input;
}

interface MissionWithGraph {
  id: number;
  name: string | null;
  execution_time: string | null;
  device: "BME_HUNITY" | "ONIONSAT_TEST" | "SLOTH";
  settings: {
    min_voltage: number;
    max_voltage: number;
    resolution: number;
  };
  featuredGraph: GraphData;
}

function getDayKey(dateStr: string | null): string {
  if (!dateStr) return "Ismeretlen";
  return new Date(dateStr).toISOString().split("T")[0];
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Ismeretlen időpont";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatDayHeading(key: string): string {
  if (key === "Ismeretlen") return key;
  const date = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function GraphPreview({
  graph,
  mission,
  className,
  preview = false,
}: {
  graph: GraphData;
  mission: MissionWithGraph;
  className?: string;
  preview?: boolean;
}) {
  const graphData = graph.data as { link?: string; file?: string };
  const imageSrc = graphData.link || graphData.file;

  if (graph.type === "custom" && imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={graph.description ?? mission.name ?? "Diagram"}
        className={className ?? "w-full h-full object-contain"}
      />
    );
  }

  if (preview) {
    return (
      <SpectrumPreview
        data={{
          packets: mission.featuredGraph.spectrumData.packets,
          min_threshold: mission.settings.min_voltage,
          max_threshold: mission.settings.max_voltage,
          resolution: mission.settings.resolution,
        }}
        className={className}
      />
    );
  }

  return (
    <Spectrum
      className={className}
      data={{
        packets: mission.featuredGraph.spectrumData.packets,
        min_threshold: mission.settings.min_voltage,
        max_threshold: mission.settings.max_voltage,
        resolution: mission.settings.resolution,
      }}
    />
  );
}

function FeaturedMissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;
  const missionHref = `/missions/${mission.id}`;

  return (
    <div className="bg-[#171717] px-5 lg:px-50 2xl:px-100 py-10 overflow-hidden flex flex-col-reverse lg:flex-row min-h-[260px]">
      <div className="flex flex-col justify-between gap-6 lg:w-[45%] px-5">
        <div className="flex flex-col gap-3">
          <h2 className="text-[22px] leading-[28px] font-semibold text-white">
            {mission.name ?? `Küldetés #${mission.id}`}
          </h2>
          <p className="text-sm text-white/70">
            <span className="font-semibold text-white/80">Dátum:</span>{" "}
            {formatDateTime(mission.execution_time)}
          </p>
          {graph.description && (
            <p className="text-sm leading-6 text-white/60">
              {graph.description}
            </p>
          )}
        </div>
        <a
          href={missionHref}
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Tovább <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className="flex items-center justify-center p-6 lg:w-[55%]">
        <div className="min-h-[240px] w-full rounded-lg p-3">
          <GraphPreview
            graph={graph}
            mission={mission}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;
  const missionHref = `/missions/${mission.id}`;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white">
            {mission.name ?? `Küldetés #${mission.id}`}
          </h3>
          <p className="text-xs text-white/60">
            <span className="font-medium text-white/70">Dátum:</span>{" "}
            {formatDateTime(mission.execution_time)}
          </p>
        </div>
        <a
          href={missionHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Megnyitás"
          className="rounded-md border border-[#2a2a2a] bg-[#1b1b1b] p-1 text-white/60"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
        <div className="h-[200px] w-full">
          <GraphPreview
            graph={graph}
            mission={mission}
            className="h-full w-full object-contain"
            preview={true}
          />
        </div>
      </div>
    </div>
  );
}

export default async function MissionsPage() {
  const supabase = await createClient();

  const { data: featuredGraphs, error: graphsError } = await supabase
    .from("graphs")
    .select("id, mission, type, description, data")
    .eq("published", true)
    .eq("featured", true)
    .order("id", { ascending: false });

  const { data: packets, error: packetsError } = await supabase
    .from("packets")
    .select("id, type, packet, mission_id")
    .eq("type", "SPECTRUM")
    .in("mission_id", featuredGraphs?.map((g) => g.mission) ?? [])
    .order("id", { ascending: true });

  if (graphsError || packetsError) {
    return (
      <div className="bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-sm text-red-400">
            Hiba a diagrammok betöltése során:{" "}
            {graphsError?.message ?? packetsError?.message}
          </p>
        </div>
      </div>
    );
  }

  const latestGraphByMission = new Map<number, GraphData>();
  for (const graph of featuredGraphs ?? []) {
    if (!latestGraphByMission.has(graph.mission)) {
      latestGraphByMission.set(graph.mission, {
        ...graph,
        spectrumData: {
          packets: packets
            ?.filter((p) => p.mission_id === graph.mission)
            .map((p) => p.packet),
          min_threshold: 0,
          max_threshold: 3300,
          resolution: 1,
        },
      });
    }
  }

  const missionIds = [...latestGraphByMission.keys()];

  if (missionIds.length === 0) {
    return (
      <div className="bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-4">
          <h1 className="text-[40px] leading-[48px] font-semibold text-center">
            Méréseink
          </h1>
          <p className="text-sm text-white/60 text-center">
            Nincsenek publikált mérések egyelőre.
          </p>
        </div>
      </div>
    );
  }

  const { data: missions, error: missionsError } = await supabase
    .from("missions")
    .select(
      "id, name, execution_time, device, settings(min_voltage, max_voltage, resolution)",
    )
    .eq("status", "PUBLISHED")
    .in("id", missionIds)
    .order("execution_time", { ascending: false });

  if (missionsError) {
    return (
      <div className="bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-sm text-red-400">
            Hiba a mérések betöltése során: {missionsError.message}
          </p>
        </div>
      </div>
    );
  }

  const processedMissions: MissionWithGraph[] = (missions ?? [])
    .map((mission) => {
      const featuredGraph = latestGraphByMission.get(mission.id);
      if (!featuredGraph) return null;
      return { ...mission, featuredGraph } as unknown as MissionWithGraph;
    })
    .filter((m): m is MissionWithGraph => m !== null);

  // The most recent mission (first after ordering by execution_time DESC) is shown as the featured one.
  // Destructuring an empty array yields undefined for featuredMission, which is handled by the conditional below.
  const [featuredMission, ...remainingMissions] = processedMissions;

  const groupedByDay = new Map<string, MissionWithGraph[]>();
  for (const mission of remainingMissions) {
    const key = getDayKey(mission.execution_time);
    const group = groupedByDay.get(key) ?? [];
    group.push(mission);
    groupedByDay.set(key, group);
  }

  return (
    <div className="bg-[#0b0b0b] text-white">
      <div className="max-w-full mx-auto pb-24 pt-10 flex flex-col gap-16">
        <h1 className="text-[40px] leading-[48px] font-semibold text-center">
          Méréseink
        </h1>

        {featuredMission && <FeaturedMissionCard mission={featuredMission} />}

        {groupedByDay.size > 0 && (
          <section className="flex flex-col gap-10 w-10xl mx-auto">
            <h2 className="text-[28px] leading-[34px] font-semibold text-center">
              További méréseink
            </h2>
            <div className="flex flex-col gap-12">
              {[...groupedByDay.entries()].map(([dayKey, dayMissions]) => (
                <section key={dayKey}>
                  <h3 className="text-base font-semibold text-white/70 mb-6">
                    {formatDayHeading(dayKey)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {dayMissions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
