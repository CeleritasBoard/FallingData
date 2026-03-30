"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/src/components/card.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import {
  CircleCheckBig,
  Clock,
  ClockArrowUp,
  CloudAlert,
  Edit,
  HardDriveDownload,
  HardDriveUpload,
  PlusCircle,
  Rocket,
} from "lucide-react";
import { UtemezesDialog } from "./utemezes-dialog.tsx";
import { MegszakitasDialog } from "./megszakitas-dialog";
import { ManualLinkDialog } from "./manual-link-dialog.tsx";
import { useState } from "react";
import apiFetch from "@/lib/api_client.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/src/components/avatar.tsx";
import { Enums } from "@repo/supabase/database.types.ts";

interface AlapadatokData {
  nev: string;
  status: string;
  letrehozo: string;
  avatar: string | null;
  exec_time?: string;
}

function StatusIcon({
  status,
  className,
}: {
  status: Enums<"MissionState">;
  className: string;
}) {
  const iconMap: Record<Enums<"MissionState">, React.ReactNode> = {
    CREATED: <PlusCircle className={className} />,
    SCHEDULED: <ClockArrowUp className={className} />,
    UPLOADED: <HardDriveUpload className={className} />,
    EXECUTING: <Rocket className={className} />,
    PROCESSING: <HardDriveDownload className={className} />,
    PUBLISHED: <CircleCheckBig className={className} />,
    ABORTED: <CloudAlert className={className} />,
  };
  return iconMap[status];
}

export function AlapadatokCard({
  data,
  mission_id,
  device,
}: {
  data: AlapadatokData;
  mission_id: string;
  device: Enums<"device"> | null | undefined;
}) {
  const [utemezesDialogOpen, setUtemezesDialogOpen] = useState(false);
  const [megszakitasDialogOpen, setMegszakitasDialogOpen] = useState(false);
  const [manualLinkOpen, setManualLinkOpen] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [missionName, setMissionName] = useState(data.nev);
  return (
    <>
      <Card className="h-full gap-0 py-2">
        <CardHeader>
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
            <StatusIcon
              status={data.status as Enums<"MissionState">}
              className="h-5 w-5 text-foreground"
            />
            <span className="text-sm font-medium text-foreground">
              {data.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={data.avatar ?? undefined}
                alt={data.letrehozo}
              />
              <AvatarFallback>
                <span className="h-full w-full rounded-full bg-blue-500" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{data.letrehozo}</span>
          </div>

          <p className="text-sm text-muted-foreground align-middle">
            <Clock className="h-5 w-5 inline-block mr-2" />
            {data.exec_time || "Végrehajtási időpont megadása"}
          </p>

          <div className="flex items-center gap-3 pt-2">
            {data.status === "CREATED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUtemezesDialogOpen(true)}
              >
                Ütemezés
              </Button>
            )}
            {(data.status === "SCHEDULED" ||
              data.status === "UPLOADED" ||
              data.status === "PROCESSING") && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setMegszakitasDialogOpen(true)}
              >
                Megszakítás
              </Button>
            )}
            {data.status === "PROCESSING" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualLinkOpen(true)}
              >
                További packetek csatolása
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
      <ManualLinkDialog
        open={manualLinkOpen}
        onOpenChange={setManualLinkOpen}
        missionId={mission_id}
        device={device}
        executionTime={data.exec_time}
      />
    </>
  );
}
