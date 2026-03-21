import { createClient } from "@/lib/supabase/server";
import { Badge } from "@workspace/ui/components/badge";
import { Calendar, Cpu } from "lucide-react";

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

function getDayKey(dateStr: string | null): string {
  if (!dateStr) return "Ismeretlen";
  return new Date(dateStr).toISOString().split("T")[0];
}

function formatDay(key: string): string {
  if (key === "Ismeretlen") return key;
  // Use noon UTC to avoid date shifting when interpreting a YYYY-MM-DD string
  const date = new Date(key + "T12:00:00Z");
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Ismeretlen időpont";
  // dateStr is a full ISO timestamp (UTC); new Date() correctly converts to local time for display
  const date = new Date(dateStr);
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "Ismeretlen időpont";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deviceLabel(device: string): string {
  switch (device) {
    case "BME_HUNITY":
      return "BME HUnity";
    case "ONIONSAT_TEST":
      return "OnionSat Test";
    case "SLOTH":
      return "Sloth";
    default:
      return device;
  }
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

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground px-4 text-center w-full h-full">
      <span className="text-4xl">📡</span>
      <span className="text-sm">Spektrum diagram</span>
    </div>
  );
}

function FeaturedMissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-1/2 aspect-video md:aspect-auto bg-muted flex items-center justify-center overflow-hidden">
        <GraphPreview graph={graph} missionName={mission.name} />
      </div>
      <div className="md:w-1/2 p-6 flex flex-col gap-4 justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Kiemelt mérés</Badge>
          <Badge variant="secondary">
            {graph.type === "spectrum" ? "Spektrum" : "Egyéni diagram"}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold leading-snug">
          {mission.name ?? `Mérés #${mission.id}`}
        </h2>
        {graph.description && (
          <p className="text-muted-foreground">{graph.description}</p>
        )}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDateTime(mission.execution_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 shrink-0" />
            <span>{deviceLabel(mission.device)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        <GraphPreview graph={graph} missionName={mission.name} />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-semibold leading-snug">
          {mission.name ?? `Mérés #${mission.id}`}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatTime(mission.execution_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 shrink-0" />
            <span>{deviceLabel(mission.device)}</span>
          </div>
        </div>

        {graph.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {graph.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Badge variant="secondary">
            {graph.type === "spectrum" ? "Spektrum" : "Egyéni diagram"}
          </Badge>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-destructive">
          Hiba a diagrammok betöltése során: {graphsError.message}
        </p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-center">Méréseink</h1>
        <p className="text-muted-foreground text-center">
          Nincsenek publikált mérések egyelőre.
        </p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-destructive">
          Hiba a mérések betöltése során: {missionsError.message}
        </p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      <h1 className="text-4xl font-bold text-center">Méréseink</h1>

      {featuredMission && <FeaturedMissionCard mission={featuredMission} />}

      {groupedByDay.size > 0 && (
        <div className="flex flex-col gap-12">
          {[...groupedByDay.entries()].map(([dayKey, dayMissions]) => (
            <section key={dayKey}>
              <h2 className="text-xl font-semibold mb-5 capitalize">
                {formatDay(dayKey)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dayMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
