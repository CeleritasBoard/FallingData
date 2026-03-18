"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/src/components/dialog.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import { Input } from "@workspace/ui/src/components/input.tsx";
import { Label } from "@workspace/ui/src/components/label.tsx";
import { Checkbox } from "@workspace/ui/src/components/checkbox.tsx";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/src/components/radio-group.tsx";
import { Slider } from "@workspace/ui/src/components/slider.tsx";

import apiFetch from "@/lib/api_client.ts";
import { Tables } from "@repo/supabase/database.types";

interface BeallitasokDialogProps {
  open: boolean;
  mission_id: string;
  onOpenChange: (open: boolean) => void;
  initialData?: Tables<"mission_settings">;
}

export function BeallitasokDialog({
  open,
  onOpenChange,
  initialData,
  mission_id,
}: BeallitasokDialogProps) {
  // Form state
  const [tipus, setTipus] = useState(initialData?.type ?? "MAX_HITS");
  const [meresiTartomany, setMeresiTartomany] = useState<[number, number]>([
    initialData?.min_voltage ?? 189,
    initialData?.max_voltage ?? 3300,
  ]);
  const [sampling, setSampling] = useState(initialData?.samples ?? 5);
  const [felbontas, setFelbontas] = useState(initialData?.resolution ?? 128);
  const [meresHossza, setMeresHossza] = useState(initialData?.duration ?? 4000);
  const [okezas, setOkezas] = useState(initialData?.is_okay == 1);
  const [headerPacket, setHeaderPacket] = useState(initialData?.is_header == 1);
  const [folytatasHaMegtelik, setFolytatasHaMegtelik] = useState(
    initialData?.continue_with_full_channel == 1,
  );

  // Mentés gomb kezelése
  async function handleSave() {
    const formData = {
      type: tipus,
      is_okay: okezas,
      is_header: headerPacket,
      continue_with_full_channel: folytatasHaMegtelik,
      duration: meresHossza,
      min_voltage: meresiTartomany[0],
      max_voltage: meresiTartomany[1],
      samples: sampling,
      resolution: felbontas,
    };
    console.log(formData);
    const response = await apiFetch(
      `/missions/${mission_id}/settings`,
      "POST",
      formData,
    );
    console.log("This is the response: ", response);
    console.log("Beállítások mentése:", formData);
    onOpenChange(false);
  }

  // Visszalépés - bezárjuk a dialogot mentés nélkül
  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beállítások szerkesztése</DialogTitle>
          <DialogDescription>
            Módosítsd a küldetésed részleteit, majd ha készen vagy mentsd el
            őket.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Típus - Radio buttons */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Típus:</Label>
            <RadioGroup
              value={tipus}
              onValueChange={(e) => setTipus(e as "MAX_HITS" | "MAX_TIME")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MAX_HITS" id="max_hits" />
                <Label
                  htmlFor="max_hits"
                  className="font-normal cursor-pointer"
                >
                  MAX_HITS
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MAX_TIME" id="max_time" />
                <Label
                  htmlFor="max_time"
                  className="font-normal cursor-pointer"
                >
                  MAX_TIME
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mérési tartomány - Dual slider */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Mérési tartomány:</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">0</span>
              <Slider
                value={meresiTartomany}
                onValueChange={(value) =>
                  setMeresiTartomany(value as [number, number])
                }
                min={0}
                max={3300}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">3300 mV</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {meresiTartomany[0]} - {meresiTartomany[1]} mV a mérési tartomány
            </p>
          </div>

          {/* Sampling */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sampling" className="text-sm font-medium">
              Sampling:
            </Label>
            <Input
              id="sampling"
              type="number"
              value={sampling}
              onChange={(e) => setSampling(Number(e.target.value))}
              className="w-32"
            />
          </div>

          {/* Felbontás - Slider */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Felbontás:</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">0</span>
              <Slider
                value={[felbontas]}
                onValueChange={(value) => setFelbontas(value[0])}
                min={0}
                max={1024}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">1024</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A küldetés felbontása: {felbontas} csatorna
            </p>
          </div>

          {/* A mérés hossza */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="mereshossza" className="text-sm font-medium">
              A mérés hossza (beütés):
            </Label>
            <Input
              id="mereshossza"
              type="number"
              value={meresHossza}
              onChange={(e) => setMeresHossza(Number(e.target.value))}
              className="w-32"
            />
          </div>

          {/* Checkboxok */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="okezas"
                checked={okezas === true}
                onCheckedChange={(checked) => setOkezas(checked === true)}
              />
              <Label htmlFor="okezas" className="font-normal cursor-pointer">
                Okézás
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="headerpacket"
                checked={headerPacket === true}
                onCheckedChange={(checked) => setHeaderPacket(checked === true)}
              />
              <Label
                htmlFor="headerpacket"
                className="font-normal cursor-pointer"
              >
                Header packet
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="folytatas"
                checked={folytatasHaMegtelik === true}
                onCheckedChange={(checked) =>
                  setFolytatasHaMegtelik(checked === true)
                }
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="folytatas"
                  className="font-normal cursor-pointer"
                >
                  A mérés folytatása azután, hogy betelik egy csatorna
                </Label>
                <p className="text-xs text-muted-foreground">
                  Potenciális adatvesztéssel járhat, ugyanis a csatornák nem
                  bővíthetőek
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Vissza
          </Button>
          <Button onClick={handleSave}>Mentés</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
