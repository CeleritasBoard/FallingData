"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@workspace/ui/components/carousel";
import Spectrum from "@workspace/ui/components/Spectrum";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (graphs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-12 text-center text-muted-foreground">
        <span>Ehhez a méréshez még nem érhető el diagram.</span>
      </div>
    );
  }

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
          className="max-h-[400px] object-contain"
        />
      );
    }

    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm">
        Nincs kép feltöltve.
      </div>
    );
  };

  const renderThumbnail = (graph: Graph) => {
    const imageSrc = graph.data?.link || graph.data?.file;

    if (graph.type === "custom" && imageSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={graph.description || "Diagram"}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
        Spektrum
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main carousel */}
      <div className="relative px-14">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {graphs.map((graph) => (
              <CarouselItem key={graph.id}>
                <div className="flex flex-col gap-4">
                  {(graph.featured || graph.description) && (
                    <div className="flex items-center gap-2">
                      {graph.featured && (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      )}
                      {graph.description && (
                        <p className="text-sm text-muted-foreground">
                          {graph.description}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-center rounded-lg border bg-muted/30 min-h-[300px] p-4">
                    {renderGraphContent(graph)}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Thumbnails */}
      {graphs.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {graphs.map((graph, index) => (
            <button
              key={graph.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer",
                currentIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30",
              )}
              aria-label={graph.description || `Diagram ${index + 1}`}
            >
              {renderThumbnail(graph)}
              {graph.featured && (
                <div className="absolute top-0.5 right-0.5">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
