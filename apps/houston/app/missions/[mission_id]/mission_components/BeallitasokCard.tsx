"use client";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/src/components/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/src/components/table.tsx";
import { SquarePen, Check, X } from "lucide-react";
import { BeallitasokDialog } from "./Beallitasok-dialog.tsx";
import { Tables } from "@repo/supabase/database.types.ts";

interface BeallitasItem {
  nev: string;
  ertek: string | number | boolean;
}

export function BeallitasokCard({
  initialState,
  data,
  mission_id,
  createdStatus,
}: {
  initialState?: Tables<"mission_settings">;
  data: BeallitasItem[];
  mission_id: string;
  createdStatus: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Beállítások</CardTitle>
          {createdStatus && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded p-1 hover:bg-accent transition-colors"
              aria-label="Beállítások szerkesztése"
            >
              <SquarePen className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="h-8 px-2 text-xs text-foreground font-semibold">
                  Beállítás
                </TableHead>
                <TableHead className="h-8 px-2 text-xs text-foreground font-semibold text-right">
                  Értéke
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.nev} className="border-0">
                  <TableCell className="px-2 py-1.5 text-sm text-muted-foreground">
                    {item.nev}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-sm text-right text-foreground">
                    {typeof item.ertek === "boolean" ? (
                      item.ertek ? (
                        <Check className="ml-auto h-4 w-4 text-foreground" />
                      ) : (
                        <X className="ml-auto h-4 w-4 text-foreground" />
                      )
                    ) : (
                      item.ertek
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <BeallitasokDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mission_id={mission_id}
        initialData={initialState}
      />
    </>
  );
}
