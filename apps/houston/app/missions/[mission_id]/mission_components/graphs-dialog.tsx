"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/src/components/dialog.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@workspace/ui/src/components/carousel.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/src/components/select.tsx";
import {
  Edit,
  Star,
  BookCheck,
  BookDashed,
  Trash2,
  ChartColumnBig,
  Upload,
} from "lucide-react";
import Spectrum, {
  type Input as SpectrumInput,
} from "@workspace/ui/src/components/Spectrum.tsx";
import apiFetch from "@/lib/api_client.ts";
import { createClient } from "@/lib/supabase/client.ts";

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

interface GraphsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  spectrumSettings: {
    min_threshold: number;
    max_threshold: number;
    resolution: number;
    packets: string[];
  };
}

export function GraphsDialog({
  open,
  onOpenChange,
  missionId,
  spectrumSettings,
}: GraphsDialogProps) {
  const [graphs, setGraphs] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");

  // New graph form state
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newGraphType, setNewGraphType] = useState<"spectrum" | "custom">(
    "spectrum",
  );
  const [creating, setCreating] = useState(false);

  const fetchGraphs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/missions/${missionId}/graphs`, "GET", null);
      setGraphs(data ?? []);
    } catch (e) {
      console.error("Failed to fetch graphs", e);
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    if (open) {
      fetchGraphs();
    }
  }, [open, fetchGraphs]);

  async function updateGraph(
    graphId: number,
    payload: Record<string, unknown>,
  ) {
    await apiFetch(`/missions/${missionId}/graphs/${graphId}`, "POST", payload);
  }

  async function handleToggleFeatured(graph: GraphData) {
    const newVal = !graph.featured;
    setGraphs((prev) =>
      prev.map((g) => (g.id === graph.id ? { ...g, featured: newVal } : g)),
    );
    try {
      await updateGraph(graph.id, { featured: newVal });
    } catch {
      setGraphs((prev) =>
        prev.map((g) =>
          g.id === graph.id ? { ...g, featured: graph.featured } : g,
        ),
      );
    }
  }

  async function handleTogglePublished(graph: GraphData) {
    const newVal = !graph.published;
    setGraphs((prev) =>
      prev.map((g) => (g.id === graph.id ? { ...g, published: newVal } : g)),
    );
    try {
      await updateGraph(graph.id, { published: newVal });
    } catch {
      setGraphs((prev) =>
        prev.map((g) =>
          g.id === graph.id ? { ...g, published: graph.published } : g,
        ),
      );
    }
  }

  function startEditing(graph: GraphData) {
    setEditingId(graph.id);
    setEditDescription(graph.description ?? "");
  }

  async function handleSaveDescription(graphId: number) {
    try {
      await updateGraph(graphId, { description: editDescription });
      setGraphs((prev) =>
        prev.map((g) =>
          g.id === graphId ? { ...g, description: editDescription } : g,
        ),
      );
    } finally {
      setEditingId(null);
    }
  }

  async function handleDelete(graph: GraphData) {
    if (!confirm("Biztosan törölni szeretnéd ezt a diagramot?")) return;
    try {
      const data = await apiFetch(
        `/missions/${missionId}/graphs/${graph.id}`,
        "DELETE",
        null,
      );
      setGraphs(data ?? []);
    } catch (e) {
      console.error("Failed to delete graph", e);
    }
  }

  function validateImageFile(file: File): boolean {
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      alert("Csak JPG vagy PNG fájlt lehet feltölteni.");
      return false;
    }
    return true;
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDragLeave() {
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!validateImageFile(file)) return;
    setDroppedFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) return;
    setDroppedFile(file);
  }

  async function handleCreate() {
    setCreating(true);
    try {
      let path: string | undefined;

      if (droppedFile) {
        const supabase = createClient();
        const fileName = `${Date.now()}_${droppedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("graphs")
          .upload(fileName, droppedFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("graphs")
          .getPublicUrl(uploadData.path);
        path = publicUrlData.publicUrl;
      }

      const type = droppedFile ? "custom" : newGraphType;
      const payload: { type: string; path?: string } = { type };
      if (path) payload.path = path;

      const newGraphs: GraphData[] = await apiFetch(
        `/missions/${missionId}/graphs`,
        "PUT",
        payload,
      );
      setGraphs(newGraphs);
      setDroppedFile(null);
      // Navigate to the newly created graph (last one)
      setTimeout(() => {
        if (api) {
          api.scrollTo(newGraphs.length - 1);
        }
      }, 100);
    } catch (e) {
      console.error("Failed to create graph", e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Diagrammok</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Betöltés...
          </div>
        ) : (
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {graphs.map((graph) => {
                const imageSrc = graph.data?.link || graph.data?.file;
                return (
                  <CarouselItem key={graph.id}>
                    <div className="flex flex-row gap-6 p-1">
                      <div className="flex flex-col gap-3 w-2/5 max-w-md">
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Szerkesztés"
                          onClick={() => startEditing(graph)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            graph.featured ? "Kiemelt (aktív)" : "Kiemelés"
                          }
                          onClick={() => handleToggleFeatured(graph)}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={graph.featured ? "currentColor" : "none"}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            graph.published ? "Publikus" : "Nem publikus"
                          }
                          onClick={() => handleTogglePublished(graph)}
                        >
                          {graph.published ? (
                            <BookCheck className="h-4 w-4" />
                          ) : (
                            <BookDashed className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Törlés"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(graph)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1">
                        {editingId === graph.id ? (
                          <>
                            <textarea
                              className="w-full rounded-md border bg-background p-2 text-sm resize-none"
                              rows={6}
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                            />
                            <Button
                              size="sm"
                              className="self-start"
                              onClick={() => handleSaveDescription(graph.id)}
                            >
                              Kész
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {graph.description || "Nincs leírás."}
                          </p>
                        )}
                      </div>
                      </div>

                    {/* Graph visualization */}
                      <div className="flex-1 rounded-lg overflow-hidden border bg-muted/30 min-h-[260px] flex items-center justify-center">
                      {graph.type === "spectrum" ? (
                        <Spectrum
                          data={{
                            packets: spectrumSettings.packets,
                            min_threshold: spectrumSettings.min_threshold,
                            max_threshold: spectrumSettings.max_threshold,
                            resolution: spectrumSettings.resolution,
                          }}
                        />
                      ) : imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={
                            graph.description ||
                            `Egyéni diagram a küldetéshez #${graph.id}`
                          }
                          className="max-h-[260px] object-contain"
                        />
                      ) : (
                        <div
                          className="text-sm text-muted-foreground"
                          role="status"
                          aria-live="polite"
                        >
                          Nincs kép feltöltve.
                        </div>
                      )}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}

              {/* New graph creation slide */}
              <CarouselItem>
                <div
                  className={`flex flex-col gap-4 p-1 rounded-lg border-2 border-dashed transition-colors min-h-[320px] ${
                    isDraggingOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                    <ChartColumnBig className="h-12 w-12 text-muted-foreground" />
                    {droppedFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-sm font-medium">
                          {droppedFile.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDroppedFile(null)}
                        >
                          Eltávolítás
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground text-center">
                          Húzz ide egy JPG vagy PNG képet, vagy válassz az
                          alábbi lehetőségek közül.
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Fájl feltöltése
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={handleFileInput}
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {!droppedFile && (
                    <div className="flex flex-col gap-2 px-2">
                      <label className="text-sm font-medium">Típus</label>
                      <Select
                        value={newGraphType}
                        onValueChange={(v) =>
                          setNewGraphType(v as "spectrum" | "custom")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spectrum">Spektrum</SelectItem>
                          <SelectItem value="custom">Egyéni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="px-2 pb-2">
                    <Button
                      className="w-full"
                      onClick={handleCreate}
                      disabled={creating}
                    >
                      {creating ? "Létrehozás..." : "Létrehozás"}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </DialogContent>
    </Dialog>
  );
}
