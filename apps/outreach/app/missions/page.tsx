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
  // Append T12:00:00 to avoid date shifting when interpreting a YYYY-MM-DD string as UTC
  const date = new Date(key + "T12:00:00Z");
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
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

function MissionCard({ mission }: { mission: MissionWithGraph }) {
  const graph = mission.featuredGraph;
  const graphData = graph.data as { link?: string; file?: string };
  const imageSrc = graphData.link || graphData.file;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {graph.type === "custom" && imageSrc ? (
          <img
            src={imageSrc}
            alt={graph.description ?? mission.name ?? "Diagram"}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground px-4 text-center">
            <span className="text-4xl">📡</span>
            <span className="text-sm">Spektrum diagram</span>
          </div>
        )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Méréseink</h1>
        <p className="text-muted-foreground">
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

  const groupedByDay = new Map<string, MissionWithGraph[]>();
  for (const mission of processedMissions) {
    const key = getDayKey(mission.execution_time);
    const group = groupedByDay.get(key) ?? [];
    group.push(mission);
    groupedByDay.set(key, group);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-10">Méréseink</h1>

      {groupedByDay.size === 0 ? (
        <p className="text-muted-foreground">
          Nincsenek publikált mérések egyelőre.
        </p>
      ) : (
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
