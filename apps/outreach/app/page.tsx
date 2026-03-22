import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DocumentItem } from "@/components/document";

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
  featuredGraph: GraphData;
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

function HomepageMissionCard({ mission }: { mission: MissionWithGraph }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
      <p className="text-sm font-semibold text-white">
        {mission.name ?? `Küldetés #${mission.id}`}
      </p>
      <div className="h-[180px] w-full rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
        <GraphPreview
          graph={mission.featuredGraph}
          missionName={mission.name}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

export default async function Home() {
  const supa = await createClient();

  // Fetch the last 3 published missions by id
  const { data: missions, error: missionsError } = await supa
    .from("missions")
    .select("id, name, execution_time")
    .eq("status", "PUBLISHED")
    .order("id", { ascending: false })
    .limit(3);

  // Fetch featured+published graphs for those missions
  const missionIds = (missions ?? []).map((m) => m.id);
  type RawGraph = GraphData & { mission: number };
  let graphs: RawGraph[] = [];
  let graphsError: { message: string } | null = null;
  if (missionIds.length > 0) {
    const result = await supa
      .from("graphs")
      .select("id, mission, type, description, data")
      .eq("published", true)
      .eq("featured", true)
      .in("mission", missionIds)
      .order("id", { ascending: false });
    graphs = (result.data ?? []) as RawGraph[];
    graphsError = result.error;
  }

  // For each mission pick its latest published+featured graph
  const latestGraphByMission = new Map<number, GraphData>();
  for (const graph of graphs) {
    if (!latestGraphByMission.has(graph.mission)) {
      latestGraphByMission.set(graph.mission, graph);
    }
  }

  const missionsWithGraphs: MissionWithGraph[] = (missions ?? [])
    .map((m) => {
      const g = latestGraphByMission.get(m.id);
      if (!g) return null;
      return { ...m, featuredGraph: g } as MissionWithGraph;
    })
    .filter((m): m is MissionWithGraph => m !== null);

  // Fetch the last 2 documents by id
  const { data: documents, error: docsError } = await supa
    .from("documents")
    .select("*")
    .order("id", { ascending: false })
    .limit(2);

  return (
    <div className="bg-[#0b0b0b] text-white">
      {/* Hero section */}
      <section className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 px-6 py-20 lg:flex-row lg:gap-16 lg:py-32">
        <div className="flex flex-col gap-6 lg:w-1/2">
          <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
            Celeritas Projekt
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-white/70">
            Magyar diákprojekt, amelynek célja az ionizáló sugárzás mérése
            alacsony pályán keringő CubeSat fedélzetén.
          </p>
          <div>
            <Link
              href="/the-panel"
              className="inline-block rounded-md bg-[#f3c400] px-6 py-3 text-sm font-semibold text-[#1b1b1b] transition-opacity hover:opacity-90"
            >
              Részletes leírás
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center lg:w-1/2">
          <Image
            src="/device.png"
            alt="Celeritas panel eszköz"
            width={480}
            height={480}
            className="h-auto w-full max-w-sm object-contain lg:max-w-md"
            priority
          />
        </div>
      </section>

      {/* Méréseink section */}
      <section className="border-t border-[#1e1e1e] py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-semibold lg:text-4xl">Méréseink</h2>
            <Link
              href="/missions"
              className="text-sm font-medium text-[#f3c400] hover:underline"
            >
              További mérések →
            </Link>
          </div>

          {missionsError || graphsError ? (
            <p className="text-sm text-red-400">
              Hiba a mérések betöltése során.
            </p>
          ) : missionsWithGraphs.length === 0 ? (
            <p className="text-sm text-white/60">
              Nincsenek publikált mérések egyelőre.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {missionsWithGraphs.map((mission) => (
                <HomepageMissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Megjelenések section */}
      <section className="border-t border-[#1e1e1e] py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-semibold lg:text-4xl">
              Megjelenéseink
            </h2>
            <Link
              href="/documents"
              className="text-sm font-medium text-[#f3c400] hover:underline"
            >
              További megjelenések →
            </Link>
          </div>

          {docsError ? (
            <p className="text-sm text-red-400">
              Hiba a dokumentumok betöltése során.
            </p>
          ) : (documents ?? []).length === 0 ? (
            <p className="text-sm text-white/60">
              Nincsenek dokumentumok egyelőre.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {documents.map((doc) => (
                <DocumentItem key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
