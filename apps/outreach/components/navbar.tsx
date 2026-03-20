import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "A panelről", href: "/the-panel" },
  { label: "Rólunk", href: "/the-team" },
  { label: "Méréseink", href: "/missions" },
  { label: "Dokumentumok", href: "/documents" },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Image
              src="/logo/cropped.png"
              alt="Celeritas Projekt"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
