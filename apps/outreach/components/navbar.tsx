"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "A panelről", href: "/the-panel" },
  { label: "Rólunk", href: "/the-team" },
  { label: "Méréseink", href: "/missions" },
  { label: "Dokumentumok", href: "/documents" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl gap-4 flex items-center">
            <Image
              src="/logo/cropped.png"
              alt="Celeritas Projekt"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            Celeritas Projekt
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Hamburger button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-lg font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
