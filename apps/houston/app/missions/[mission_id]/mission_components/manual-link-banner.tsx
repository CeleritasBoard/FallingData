"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "@workspace/ui/src/components/button.tsx";
import { ManualLinkDialog } from "./manual-link-dialog.tsx";

interface ManualLinkBannerProps {
  missionId: string;
  device: string | null | undefined;
  missionStatus: string | null | undefined;
  executionTime?: string | null;
}

const LINKABLE_STATUSES = new Set(["SCHEDULED", "UPLOADED", "EXECUTING"]);

export function ManualLinkBanner({
  missionId,
  device,
  missionStatus,
  executionTime,
}: ManualLinkBannerProps) {
  const [open, setOpen] = useState(false);

  if (!missionStatus || !LINKABLE_STATUSES.has(missionStatus)) {
    return null;
  }

  return (
    <>
      <div
        className="mb-6 w-full rounded-lg px-8 py-6 flex items-center justify-center"
        style={{ backgroundColor: "rgba(40, 157, 152, 0.30)" }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Rocket className="h-10 w-10 text-white" />
          <h3 className="text-lg font-semibold text-white">Végrehajtás alatt</h3>
          <p className="max-w-2xl text-sm text-white">
            Ez a küldetés éppen végrehajtódik. Ha már szerinted végzett a modul,
            rendeld hozzá packeteket az alábbi gombbal:
          </p>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Packetek linkelése →
          </Button>
        </div>
      </div>

      <ManualLinkDialog
        open={open}
        onOpenChange={setOpen}
        missionId={missionId}
        device={device}
        executionTime={executionTime}
      />
    </>
  );
}
