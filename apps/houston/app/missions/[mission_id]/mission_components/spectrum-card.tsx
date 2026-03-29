"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/src/components/card";
import { type Input as SpectrumInput } from "@workspace/ui/src/components/spectrum-preview.tsx";
import SpectrumPreview from "@workspace/ui/src/components/spectrum-preview.tsx";
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

  const latestPublishedFeatured = useMemo(() => {
    let matching: GraphData | null = null;

    for (const graph of graphs) {
      if (
        graph.published &&
        graph.featured &&
        (!matching || graph.id > matching.id)
      ) {
        matching = graph;
      }
    }

    return matching;
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

  const renderGraphContent = (graph: GraphData | null) => {
    if (!graph) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          <span>Nincs publikált és kiemelt diagram.</span>
          <span>Hozz létre egyet a szerkesztőben.</span>
        </div>
      );
    }
    const imageSrc = graph.data?.link || graph.data?.file;
    return (
      <div className="flex flex-col gap-3 px-4 pt-2">
        <div className="flex items-center justify-center rounded-md border bg-muted/30">
          {graph.type === "spectrum" ? (
            <SpectrumPreview
              data={{
                packets: data.packets ?? [],
                min_threshold: data.min_threshold,
                max_threshold: data.max_threshold,
                resolution: data.resolution,
              }}
            />
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={graph.description || "Egyéni diagram"}
              className="max-h-[220px] object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              Nincs kép feltöltve.
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="min-w-[360px]">
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
        <CardContent className="flex flex-col justify-center gap-4 h-full p-0">
          {renderGraphContent(latestPublishedFeatured)}
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
