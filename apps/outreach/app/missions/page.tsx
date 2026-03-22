import { createClient } from "@/lib/supabase/server";
import { ExternalLink, Search } from "lucide-react";

interface GraphData {
  id: number;
  type: "spectrum" | "custom";
  description: string | null;
  data: {
    link?: string;
    file?: string;
    packets?: number[];
  };
}

interface MissionWithGraph {
  id: number;
  name: string | null;
  execution_time: string | null;
  device: "BME_HUNITY" | "ONIONSAT_TEST" | "SLOTH";
  featuredGraph: GraphData;
}

type SearchParams = Record<string, string | string[] | undefined>;

const HOUSTON_BASE_URL =
  process.env.NEXT_PUBLIC_HOUSTON_URL ?? "https://houston.celeritas-board.hu";

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

function getSearchParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function SpectrumPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 220"
      className={className ?? "h-full w-full"}
      aria-hidden="true"
    >
      <g stroke="#2a2a2a" strokeWidth="1">
        <line x1="40" y1="20" x2="40" y2="190" />
        <line x1="40" y1="190" x2="400" y2="190" />
        <line x1="40" y1="150" x2="400" y2="150" />
        <line x1="40" y1="110" x2="400" y2="110" />
        <line x1="40" y1="70" x2="400" y2="70" />
        <line x1="40" y1="30" x2="400" y2="30" />
      </g>
      <g fill="#f0b100">
        <rect x="55" y="120" width="26" height="70" />
        <rect x="110" y="90" width="26" height="100" />
        <rect x="165" y="60" width="26" height="130" />
        <rect x="220" y="20" width="26" height="170" />
        <rect x="275" y="85" width="26" height="105" />
        <rect x="330" y="150" width="26" height="40" />
      </g>
      <g fill="#808080" fontSize="10" fontFamily="inherit">
        <text x="18" y="192">
          0
        </text>
        <text x="12" y="152">
          10
        </text>
        <text x="10" y="112">
          100
        </text>
        <text x="6" y="72">
          1000
        </text>
        <text x="56" y="208">
          100
        </text>
        <text x="190" y="208">
          1000
        </text>
        <text x="300" y="208">
          2000
        </text>
        <text x="360" y="208">
          3000
        </text>
      </g>
    </svg>
  );
}

function GraphPreview({
  graph,
  missionName,
  className,
}: {
  graph: GraphData;
  missionName: string | null;
  className?: string;
}) {
  const graphData = graph.data as { link?: string; file?: string };
  const imageSrc = graphData.link || graphData.file;

  if (graph.type === "custom" && imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={graph.description ?? missionName ?? "Diagram"}
        className={className ?? "w-full h-full object-contain"}
      />
    );
  }

  return <SpectrumPlaceholder className={className} />;
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
            missionName={mission.name}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;
  const missionHref = `${HOUSTON_BASE_URL}/missions/${mission.id}`;

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
        <div className="h-[140px] w-full">
          <GraphPreview
            graph={graph}
            missionName={mission.name}
            className="h-full w-full object-contain"
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

  if (graphsError) {
    return (
      <div className="bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-sm text-red-400">
            Hiba a diagrammok betöltése során: {graphsError.message}
          </p>
        </div>
      </div>
    );
  }

  const latestGraphByMission = new Map<number, GraphData>();
  for (const graph of featuredGraphs ?? []) {
    if (!latestGraphByMission.has(graph.mission)) {
      latestGraphByMission.set(graph.mission, graph as GraphData);
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
    .select("id, name, execution_time, device")
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
      return { ...mission, featuredGraph } as MissionWithGraph;
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
