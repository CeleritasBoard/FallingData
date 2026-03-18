"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/src/components/card";
import Spectrum, {
  type Input as SpectrumInput,
} from "@workspace/ui/src/components/Spectrum.tsx";
import { Edit } from "lucide-react";
import { Button } from "@workspace/ui/src/components/button.tsx";
import { GraphsDialog } from "./graphs-dialog.tsx";
import apiFetch from "@/lib/api_client.ts";

interface SpectrumCardProps {
  data: SpectrumInput;
  missionId: string;
}

interface GraphData {
  id: number;
  type: "spectrum" | "custom";
  description: string;
  featured: boolean;
  published: boolean;
  data: {
    link?: string;
    file?: string;
    packets?: string[];
  };
}

export function SpectrumCard({ data, missionId }: SpectrumCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [graphs, setGraphs] = useState<GraphData[]>([]);

  const { latestPublished, latestFeatured } = useMemo(() => {
    let published: GraphData | null = null;
    let featured: GraphData | null = null;

    for (const graph of graphs) {
      if (graph.published && (!published || graph.id > published.id)) {
        published = graph;
      }
      if (graph.featured && (!featured || graph.id > featured.id)) {
        featured = graph;
      }
    }

    return { latestPublished: published, latestFeatured: featured };
  }, [graphs]);

  useEffect(() => {
    let active = true;
    async function fetchGraphs() {
      try {
        const response = await apiFetch(
          `/missions/${missionId}/graphs`,
          "GET",
          null,
        );
        if (active) {
          setGraphs(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error("Failed to load graphs", error);
        if (active) {
          setGraphs([]);
        }
      }
    }
    fetchGraphs();
    return () => {
      active = false;
    };
  }, [missionId]);

  const renderGraphPreview = (
    graph: GraphData | null,
    label: string,
    emptyLabel: string,
  ) => {
    if (!graph) {
      return (
        <div className="flex flex-col gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <span className="text-xs font-medium text-muted-foreground/80">
            {label}
          </span>
          <span>{emptyLabel}</span>
        </div>
      );
    }

    const imageSrc = graph.data?.link || graph.data?.file;

    return (
      <div className="flex flex-col gap-2 rounded-md border p-3">
        <span className="text-xs font-medium text-muted-foreground/80">
          {label}
        </span>
        <div className="flex items-center justify-center rounded-md border bg-muted/30 min-h-[120px]">
          {graph.type === "spectrum" ? (
            <Spectrum
              data={{
                packets: graph.data?.packets ?? [],
                min_threshold: data.min_threshold,
                max_threshold: data.max_threshold,
                resolution: data.resolution,
              }}
            />
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={graph.description || "Egyéni diagram"}
              className="max-h-[120px] object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              Nincs kép feltöltve.
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {graph.description || "Nincs leírás."}
        </span>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Diagrammok</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 h-full p-0">
          <div className="grid gap-3 px-4 pt-2 md:grid-cols-2">
            {renderGraphPreview(
              latestPublished,
              "Legutóbbi publikált",
              "Nincs publikált diagram.",
            )}
            {renderGraphPreview(
              latestFeatured,
              "Legutóbbi kiemelt",
              "Nincs kiemelt diagram.",
            )}
          </div>
          <Spectrum data={data} />
        </CardContent>
      </Card>
      <GraphsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        missionId={missionId}
        spectrumSettings={data}
      />
    </>
  );
}
