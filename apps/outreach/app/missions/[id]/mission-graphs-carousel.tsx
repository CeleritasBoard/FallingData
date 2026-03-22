"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@workspace/ui/components/carousel";
import Spectrum from "@workspace/ui/components/Spectrum";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const THUMBNAIL_SPECTRUM_SCALE = 0.4;
const THUMBNAIL_INVERSE_SCALE_WIDTH = `${100 / THUMBNAIL_SPECTRUM_SCALE}%`;

type GraphData = {
  link?: string;
  file?: string;
  packets?: string[];
};

export type Graph = {
  id: number;
  type: "spectrum" | "custom";
  description: string | null;
  featured: boolean | null;
  published: boolean | null;
  data: GraphData;
};

export type SpectrumSettings = {
  packets: string[];
  min_threshold: number;
  max_threshold: number;
  resolution: number;
};

interface MissionGraphsCarouselProps {
  graphs: Graph[];
  spectrumSettings: SpectrumSettings;
}

export function MissionGraphsCarousel({
  graphs,
  spectrumSettings,
}: MissionGraphsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const updateState = () => {
      setCurrentIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    updateState();
    api.on("select", updateState);
    api.on("reInit", updateState);
    return () => {
      api.off("select", updateState);
      api.off("reInit", updateState);
    };
  }, [api]);

  if (graphs.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#2a2a2a] bg-[#111111] p-12 text-center text-white/70">
        <span>Ehhez a méréshez még nem érhető el diagram.</span>
      </div>
    );
  }

  const publishedGraphs = useMemo(
    () => graphs.filter((graph) => graph.published),
    [graphs],
  );
  const activeGraphId = graphs[currentIndex]?.id;
  const graphIndexById = useMemo(
    () => new Map(graphs.map((graph, index) => [graph.id, index])),
    [graphs],
  );

  const renderGraphContent = (graph: Graph) => {
    const imageSrc = graph.data?.link || graph.data?.file;

    if (graph.type === "spectrum") {
      return <Spectrum data={spectrumSettings} />;
    }

    if (imageSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={graph.description || "Diagram"}
          className="max-h-full max-w-full object-contain"
        />
      );
    }

    return (
      <div className="flex items-center justify-center text-white/70 text-sm">
        Nincs kép feltöltve.
      </div>
    );
  };

  const renderThumbnail = (graph: Graph) => {
    const imageSrc = graph.data?.link || graph.data?.file;

    if (graph.type === "custom" && imageSrc) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={graph.description || "Diagram"}
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="h-full w-full overflow-hidden bg-[#111111]">
        <div
          className="origin-top-left"
          style={{ transform: `scale(${THUMBNAIL_SPECTRUM_SCALE})` }}
        >
          <div style={{ width: THUMBNAIL_INVERSE_SCALE_WIDTH }}>
            <Spectrum data={spectrumSettings} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main carousel */}
      <div className="relative overflow-visible">
        <Carousel setApi={setApi}>
          <CarouselContent className="ml-0">
            {graphs.map((graph) => (
              <CarouselItem key={graph.id} className="pl-0">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="flex min-h-[360px] items-center justify-center border border-[#2a2a2a] bg-[#111111] p-6">
                    {renderGraphContent(graph)}
                  </div>
                  <div className="min-h-[360px] text-sm leading-relaxed text-white/70">
                    {graph.description || "Ehhez a diagramhoz még nem tartozik leírás."}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 text-white transition-opacity md:left-0 md:-translate-x-10",
            canScrollPrev ? "opacity-80 hover:opacity-100" : "opacity-30",
          )}
          aria-label="Előző diagram"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 text-white transition-opacity md:right-0 md:translate-x-10",
            canScrollNext ? "opacity-80 hover:opacity-100" : "opacity-30",
          )}
          aria-label="Következő diagram"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {publishedGraphs.map((graph, publishedIndex) => {
          const carouselIndex = graphIndexById.get(graph.id);
          const isActive = activeGraphId === graph.id;
          return (
            <button
              key={graph.id}
              type="button"
              onClick={() => {
                if (carouselIndex === undefined) return;
                api?.scrollTo(carouselIndex);
              }}
              className={cn(
                "relative h-[92px] w-full overflow-hidden border bg-[#111111] transition-colors",
                isActive
                  ? "border-[#f0b100] shadow-[0_0_0_1px_#f0b100]"
                  : "border-[#2a2a2a] hover:border-[#3a3a3a]",
              )}
              aria-label={graph.description || `Diagram ${publishedIndex + 1}`}
            >
              {renderThumbnail(graph)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
