"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/src/components/card.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import { Edit, PlusCircle } from "lucide-react";
import { UtemezesDialog } from "./utemezes-dialog.tsx";
import { MegszakitasDialog } from "./megszakitas-dialog";
import { useState } from "react";
import apiFetch from "@/lib/api_client.ts";

interface AlapadatokData {
  nev: string;
  status: string;
  letrehozo: string;
  exec_time?: string;
}

export function AlapadatokCard({
  data,
  mission_id,
}: {
  data: AlapadatokData;
  mission_id: string;
}) {
  const [utemezesDialogOpen, setUtemezesDialogOpen] = useState(false);
  const [megszakitasDialogOpen, setMegszakitasDialogOpen] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [missionName, setMissionName] = useState(data.nev);
  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Alapadatok</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {isNameEditing ? (
              <input
                type="text"
                value={missionName}
                onKeyUpCapture={(e) => {
                  event?.preventDefault();
                  console.log(e.key);
                  if (e.key == "Enter") {
                    apiFetch(`/missions/${mission_id}`, "POST", {
                      name: missionName,
                    })
                      .then(() => window.location.reload())
                      .catch(console.error);
                  } else if (e.key == "Escape") {
                    setIsNameEditing(false);
                  }
                }}
                onChange={(e) => setMissionName(e.target.value)}
                className="font-semibold text-foreground border-white border-2 rounded px-2"
              />
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  {data.nev}
                </span>
                <Edit
                  className="h-4 w-4 text-muted-foreground"
                  onClick={() => setIsNameEditing(true)}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">
              {data.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm text-foreground">{data.letrehozo}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            {data.exec_time || "Végrehajtási időpont megadása"}
          </p>

          <div className="flex items-center gap-3 pt-2">
            {(data.status == "CREATED" ||
              data.status == "PROCESSING" ||
              data.status == "PUBLISHED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUtemezesDialogOpen(true)}
              >
                Ütemezés
              </Button>
            )}
            {(data.status == "SCHEDULED" ||
              data.status == "UPLOADED" ||
              data.status == "PROCESSING") && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setMegszakitasDialogOpen(true)}
              >
                Megszakítás
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <MegszakitasDialog
        open={megszakitasDialogOpen}
        onOpenChange={setMegszakitasDialogOpen}
        id={mission_id}
        status={data.status}
      />
      <UtemezesDialog
        open={utemezesDialogOpen}
        onOpenChange={setUtemezesDialogOpen}
        id={mission_id}
      />
    </>
  );
}
