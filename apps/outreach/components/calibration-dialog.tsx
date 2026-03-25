"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

export function CalibrationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
          aria-label="A kalibrációs görbe nagyítása"
        >
          <span className="sr-only">Nagyítás</span>
          <Image
            src="/panel/calibration.png"
            alt="A kalibrációs görbe"
            width={900}
            height={520}
            className="h-auto w-full max-w-[520px]"
            sizes="(min-width: 768px) 520px, 90vw"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            Nagyítás
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl border-[#2a2a2a] bg-[#0b0b0b] p-4 text-white sm:p-6">
        <div className="space-y-3">
          <DialogHeader className="text-center">
            <DialogTitle className="text-sm font-semibold text-white">
              A kalibrációs görbe
            </DialogTitle>
            <DialogDescription className="sr-only">
              A kalibrációs görbe teljes méretben.
            </DialogDescription>
          </DialogHeader>
          <div
            className="max-h-[80vh] overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
            tabIndex={0}
            role="region"
            aria-label="Kalibrációs görbe nagyított nézet"
          >
            <Image
              src="/panel/calibration.png"
              alt="A kalibrációs görbe teljes méretben"
              width={1400}
              height={820}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 900px, 90vw"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
