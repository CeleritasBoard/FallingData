import Link from "next/link";

const sitemapItems = [
  {
    title: "Bemutatkozás",
    items: [
      { label: "Kezdőlap", href: "/" },
      { label: "A panel", href: "/the-panel" },
      { label: "Rólunk", href: "/the-team" },
    ],
  },
  {
    title: "Eredményeink",
    items: [
      { label: "Méréseink", href: "/missions" },
      { label: "Dokumentumok", href: "/documents" },
      { label: "Houston", href: "https://houston.celeritas-board.hu" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/">
              <img
                src="/logo/full.png"
                alt="Celeritas Projekt"
                width={200}
                height={60}
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              © {currentYear} Celeritas Projekt
            </p>
          </div>
          <div className="flex flex-row self-end gap-8">
            {sitemapItems.map((cat) => (
              <div key={cat.title}>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  {cat.title}
                </h3>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
