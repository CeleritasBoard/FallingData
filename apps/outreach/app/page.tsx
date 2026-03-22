import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DocumentItem } from "@/components/document";
import Spectrum, {
  type Input as SpectrumInput,
} from "@workspace/ui/src/components/Spectrum.tsx";

interface GraphData {
  id: number;
  type: "spectrum" | "custom";
  description: string | null;
  data: {
    link?: string;
    file?: string;
    packets?: Array<number | string>;
  };
}

type MissionSettingsRow = {
  id: number;
  min_voltage: number | null;
  max_voltage: number | null;
  resolution: number | null;
};

type PacketRow = {
  id: number;
  packet: string;
};

interface MissionWithGraph {
  id: number;
  name: string | null;
  execution_time: string | null;
  featuredGraph: GraphData | null;
  spectrumData: SpectrumInput | null;
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
  spectrumData,
  className,
}: {
  graph: GraphData | null | undefined;
  missionName: string | null;
  spectrumData: SpectrumInput | null;
  className?: string;
}) {
  if (!graph) {
    return <SpectrumPlaceholder className={className} />;
  }

  const graphData = graph.data as { link?: string; file?: string };
  const imageSrc = graphData.link || graphData.file;

  if (graph.type === "spectrum" && spectrumData) {
    return (
      <Spectrum data={spectrumData} className="h-full min-h-0 w-full" />
    );
  }

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
  const missionHref = `/missions/${mission.id}`;
  const missionLabel = mission.name ?? `Küldetés #${mission.id}`;

  return (
    <div className="flex w-full max-w-[260px] flex-col gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-start font-semibold text-white">
            {missionLabel}
          </p>
          <p className="text-xs text-white/60">
            <span className="font-medium text-white/70">Dátum:</span>{" "}
            {formatDateTime(mission.execution_time)}
          </p>
        </div>
        <Link
          href={missionHref}
          aria-label={`${missionLabel} megnyitása`}
          className="rounded-md border border-[#2a2a2a] bg-[#1b1b1b] p-1 text-white/60 transition-colors hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
        <div className="h-[140px] w-full">
          <GraphPreview
            graph={mission.featuredGraph}
            missionName={mission.name}
            spectrumData={mission.spectrumData}
            className="h-full w-full object-contain"
          />
        </div>
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

  const { data: missionSettings, error: settingsError } =
    missionIds.length > 0
      ? await supa
          .from("mission_settings")
          .select("id, min_voltage, max_voltage, resolution")
          .in("id", missionIds)
      : { data: [] as MissionSettingsRow[], error: null };

  const spectrumPacketIds = new Set<number>();
  for (const graph of graphs) {
    if (graph.type !== "spectrum") continue;
    const packets = graph.data?.packets;
    if (!Array.isArray(packets)) continue;
    for (const packetId of packets) {
      const parsedId =
        typeof packetId === "number" ? packetId : Number(packetId);
      if (Number.isFinite(parsedId)) {
        spectrumPacketIds.add(parsedId);
      }
    }
  }

  let packetsError: typeof missionsError = null;
  let packetsData: PacketRow[] = [];
  if (spectrumPacketIds.size > 0) {
    const result = await supa
      .from("packets")
      .select("id, packet")
      .in("id", Array.from(spectrumPacketIds))
      .returns<PacketRow[]>();
    packetsData = result.data ?? [];
    packetsError = result.error;
  }

  const settingsByMission = new Map<number, MissionSettingsRow>();
  for (const setting of missionSettings ?? []) {
    settingsByMission.set(setting.id, setting);
  }

  const packetById = new Map<number, string>();
  for (const packet of packetsData) {
    packetById.set(packet.id, packet.packet);
  }

  // For each mission pick its latest published+featured graph
  const latestGraphByMission = new Map<number, GraphData>();
  for (const graph of graphs) {
    if (!latestGraphByMission.has(graph.mission)) {
      latestGraphByMission.set(graph.mission, graph);
    }
  }

  const missionsWithGraphs: MissionWithGraph[] = (missions ?? []).map((m) => {
    const graph = latestGraphByMission.get(m.id) ?? null;
    let spectrumData: SpectrumInput | null = null;
    if (graph?.type === "spectrum") {
      const setting = settingsByMission.get(m.id);
      const packets = Array.isArray(graph.data?.packets)
        ? graph.data.packets
            .map((packetId) =>
              typeof packetId === "number" ? packetId : Number(packetId),
            )
            .filter((packetId): packetId is number => Number.isFinite(packetId))
            .map((packetId) => packetById.get(packetId))
            .filter((packet): packet is string => Boolean(packet))
        : [];

      if (
        setting &&
        setting.min_voltage !== null &&
        setting.max_voltage !== null &&
        setting.resolution !== null &&
        packets.length > 0
      ) {
        spectrumData = {
          packets,
          min_threshold: setting.min_voltage,
          max_threshold: setting.max_voltage,
          resolution: setting.resolution,
        };
      }
    }

    return {
      ...m,
      featuredGraph: graph,
      spectrumData,
    };
  });

  // Fetch the last 2 documents by id
  const { data: documents, error: docsError } = await supa
    .from("documents")
    .select("*")
    .order("id", { ascending: false })
    .limit(2);

  const buttonClass =
    "inline-flex items-center gap-2 rounded-md bg-[#d9d9d9] px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#e3e3e3]";

  return (
    <div className="bg-[#0b0b0b] text-white">
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 pb-16 pt-12 text-center">
        <h1 className="text-[48px] leading-[48px] font-bold">
          Celeritas Projekt
        </h1>
        <p className="text-md text-white/70">Sugárzásmérő diákpanel az űrben</p>
        <div className="flex w-full justify-center pt-4">
          <Image
            src="/device.png"
            alt="Celeritas panel eszköz"
            width={520}
            height={320}
            className="h-auto w-full max-w-[360px] object-contain"
            priority
          />
        </div>
      </section>

      <section className="bg-[#171717] py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
          <h2 className="text-4xl font-semibold">A modulról</h2>
          <p className="text-lg leading-relaxed text-white text-justify">
            A Celeritas modul egy spektroszkópiai képességekkel is rendelkező
            szcintillációs számláló, mely főleg röntgen és 1 MeV-ig gamma
            tartományú sugárzás észlelésére képes. A projektet a BME VIK HVT
            által fejlesztett és az NMHH támogatásával megvalósult Hunity
            (NMHH-1) műhold fedélzetére fejlesztették középiskolás diákok, mint
            a diákkísérlet alrendszert.
          </p>
          <Link href="/the-panel" className={buttonClass}>
            Részletes leírás <span>→</span>
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 px-6 text-center">
          <h2 className="text-3xl font-semibold">Méréseink</h2>

          {missionsError || graphsError || settingsError || packetsError ? (
            <p className="text-sm text-red-400">
              Hiba a mérések betöltése során.
            </p>
          ) : missionsWithGraphs.length === 0 ? (
            <p className="text-sm text-white/60">
              Nincsenek publikált mérések egyelőre.
            </p>
          ) : (
            <div className="flex w-full flex-wrap justify-center gap-6">
              {missionsWithGraphs.map((mission) => (
                <HomepageMissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}

          <Link href="/missions" className={buttonClass}>
            További mérések <span>→</span>
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold">Sajtó</h2>
            <p className="text-sm text-white/60">
              A projekttel kapcsolatos további megjelenéseink
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <h3 className="text-2xl font-semibold">Dokumentáció</h3>

            {docsError ? (
              <p className="text-sm text-red-400">
                Hiba a dokumentumok betöltése során.
              </p>
            ) : (documents ?? []).length === 0 ? (
              <p className="text-sm text-white/60">
                Nincsenek dokumentumok egyelőre.
              </p>
            ) : (
              <div className="flex w-full max-w-xl flex-col gap-4">
                {documents.map((doc) => (
                  <DocumentItem key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            <Link href="/documents" className={buttonClass}>
              További megjelenések <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#171717] py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center">
          <h2 className="text-3xl font-semibold">Kapcsolatfelvétel</h2>
          <p className="text-sm text-white/60">
            Ha felkeltette projektünk érdeklődésedet, az alábbi címen érsz el
            minket:
          </p>
          <p className="text-lg font-semibold">hello@celeritas-board.hu</p>
        </div>
      </section>
    </div>
  );
}
