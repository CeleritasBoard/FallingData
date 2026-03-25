"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

export function ZoomDialog({
  children,
  sizeClasses = "",
}: {
  children: React.ReactNode;
  sizeClasses?: string;
}) {
  return (
    <>
      <div className="md:hidden">{children}</div>
      <div className="hidden md:block">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="group relative overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
              aria-label="A kalibrációs görbe nagyítása"
            >
              <span className="sr-only">Nagyítás</span>
              {children}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Nagyítás
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="border-[#2a2a2a] bg-[#0b0b0b] p-4 text-white sm:p-6 !max-w-fit !max-h-fit">
            <div className="mt-4 space-y-10">
              <div
                className={`overflow-auto ${sizeClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3c400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]`}
                tabIndex={0}
              >
                {children}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
