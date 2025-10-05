"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "../public/logo.png";

export function TeamSwitcher() {
  return (
    <div className="gap-2 p-2">
      <div className="flex  items-center rounded-md">
        <div className="rounded-md bg-[#6A6A6A] mr-5">
          <Image src={Logo} alt="Logo" className="size-10 shrink-0" />
        </div>
        <div className="block">
          <div className="font-bold text-sm">Celeritas</div>
          <div className="text-xs">Houston</div>
        </div>
      </div>
    </div>
  );
}
