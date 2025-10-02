"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "../public/logo.png";

export function TeamSwitcher() {
  return (
    <div className="gap-2 p-2">
      <div className="flex size-6 items-center justify-center rounded-md border">
        <Image src={Logo} alt="Logo" className="size-3.5 shrink-0" />
        <div className="block">
          <div>Celeritas</div>
          <div>Houston</div>
        </div>
      </div>
    </div>
  );
}
