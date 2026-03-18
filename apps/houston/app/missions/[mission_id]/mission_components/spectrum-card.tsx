"use client";

import { useState } from "react";
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

interface SpectrumCardProps {
  data: SpectrumInput;
  missionId: string;
}

export function SpectrumCard({ data, missionId }: SpectrumCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <CardContent className="flex flex-col justify-center h-full p-0">
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
