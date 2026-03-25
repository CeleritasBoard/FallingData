"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/src/components/dialog.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import { Input } from "@workspace/ui/src/components/input.tsx";
import { Label } from "@workspace/ui/src/components/label.tsx";
import { Checkbox } from "@workspace/ui/src/components/checkbox.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/src/components/table.tsx";
import apiFetch from "@/lib/api_client.ts";
import { createClient } from "@/lib/supabase/client.ts";
import type { Tables } from "@repo/supabase/database.types";

type PacketRow = Tables<"packets">;

interface ManualLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  device: PacketRow["device"] | null | undefined;
  executionTime?: string | null;
}

const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const parseInputDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplayDate = (value: string | null) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("hu-HU");
};

const resolveInitialRange = (executionTime?: string | null) => {
  const now = new Date();
  if (executionTime) {
    const base = new Date(executionTime);
    if (!Number.isNaN(base.getTime())) {
      return {
        from: new Date(base.getTime() - 12 * MILLISECONDS_IN_HOUR),
        to: new Date(base.getTime() + 12 * MILLISECONDS_IN_HOUR),
      };
    }
  }
  return {
    from: new Date(now.getTime() - 24 * MILLISECONDS_IN_HOUR),
    to: now,
  };
};

export function ManualLinkDialog({
  open,
  onOpenChange,
  missionId,
  device,
  executionTime,
}: ManualLinkDialogProps) {
  const initialRange = useMemo(
    () => resolveInitialRange(executionTime),
    [executionTime],
  );
  const [fromValue, setFromValue] = useState(() =>
    toLocalInputValue(initialRange.from),
  );
  const [toValue, setToValue] = useState(() =>
    toLocalInputValue(initialRange.to),
  );
  const [packets, setPackets] = useState<PacketRow[]>([]);
  const [hoveredPacket, setHoveredPacket] = useState<PacketRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setHoveredPacket(null);
      setPackets([]);
      setFromValue(toLocalInputValue(initialRange.from));
      setToValue(toLocalInputValue(initialRange.to));
    }
  }, [open, initialRange]);

  const fetchPackets = useCallback(async () => {
    if (!device) {
      setPackets([]);
      setHoveredPacket(null);
      return;
    }

    const fromDate = parseInputDate(fromValue);
    const toDate = parseInputDate(toValue);

    if (!fromDate || !toDate || fromDate > toDate) {
      setPackets([]);
      setHoveredPacket(null);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("packets")
        .select("id, type, date, packet, details, device")
        .eq("device", device)
        .gte("date", fromDate.toISOString())
        .lte("date", toDate.toISOString())
        .order("date", { ascending: false });

      if (error) {
        console.error("Failed to fetch packets", error);
        setPackets([]);
        setHoveredPacket(null);
        return;
      }

      const items = data ?? [];
      setPackets(items);
      setHoveredPacket((current) => current ?? items[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, [device, fromValue, toValue]);

  useEffect(() => {
    if (!open) return;
    fetchPackets();
  }, [open, fetchPackets]);

  const toggleSelection = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((v) => v !== id),
    );
  };

  async function handleSave() {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      await apiFetch(`/missions/${missionId}/link`, "PATCH", {
        packets: selectedIds,
      });
      onOpenChange(false);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[1100px] flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle>Packetek linkelése</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Kijelölve: {selectedCount}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="packet-date-from">Kezdet</Label>
                  <Input
                    id="packet-date-from"
                    type="datetime-local"
                    value={fromValue}
                    onChange={(event) => setFromValue(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="packet-date-to">Vég</Label>
                  <Input
                    id="packet-date-to"
                    type="datetime-local"
                    value={toValue}
                    onChange={(event) => setToValue(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-auto max-h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-10 px-2" />
                    <TableHead className="h-8 px-2 text-xs font-semibold">
                      ID
                    </TableHead>
                    <TableHead className="h-8 px-2 text-xs font-semibold">
                      Típus
                    </TableHead>
                    <TableHead className="h-8 px-2 text-xs font-semibold">
                      Dátum
                    </TableHead>
                    <TableHead className="h-8 px-2 text-xs font-semibold">
                      Packet
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Betöltés...
                      </TableCell>
                    </TableRow>
                  ) : packets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Nincs megjeleníthető packet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    packets.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <TableRow
                          key={item.id}
                          className={`border-0 hover:bg-muted/30 ${
                            isSelected ? "bg-muted/40" : ""
                          }`}
                          onMouseEnter={() => setHoveredPacket(item)}
                        >
                          <TableCell className="px-2 py-1.5">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                toggleSelection(item.id, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-sm">
                            {item.id}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-sm">
                            {item.type ?? "N/A"}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-sm">
                            {formatDisplayDate(item.date)}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs font-mono">
                            {item.packet ?? "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="w-full lg:w-[320px] border rounded-lg p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Részletek</h3>
            {hoveredPacket ? (
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="font-medium">{hoveredPacket.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Típus</p>
                  <p className="font-medium">{hoveredPacket.type ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dátum</p>
                  <p className="font-medium">
                    {formatDisplayDate(hoveredPacket.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Packet</p>
                  <p className="font-mono text-xs break-all">
                    {hoveredPacket.packet ?? "N/A"}
                  </p>
                </div>
                {hoveredPacket.details ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Részletes</p>
                    <pre className="text-xs whitespace-pre-wrap break-words rounded-md bg-muted/30 p-2">
                      {JSON.stringify(hoveredPacket.details, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Válassz egy packetet a részletekhez.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          <Button onClick={handleSave} disabled={selectedCount === 0 || saving}>
            {saving ? "Mentés..." : "Mentés"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
