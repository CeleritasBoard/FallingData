import { createClient } from "@/lib/supabase/server";
import { ExternalLink, FileText, Link as LinkIcon } from "lucide-react";

type Document = {
  id: number;
  path: string;
  title: string | null;
  authors: string[] | null;
  date: string;
  type: "file" | "url";
  uploader: string | null;
};

interface DocumentItemProps {
  doc: Document;
}

export async function DocumentItem({ doc }: DocumentItemProps) {
  let url: string;

  if (doc.type === "file") {
    const supabase = await createClient();
    const { data } = supabase.storage.from("docs").getPublicUrl(doc.path);
    url = data.publicUrl;
  } else {
    url = doc.path;
  }

  const dateObj = new Date(doc.date);
  const formattedDate = isNaN(dateObj.getTime())
    ? doc.date
    : dateObj.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const displayTitle =
    doc.title ??
    (doc.type === "file" ? doc.path.split("/").pop() ?? doc.path : doc.path);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
        {doc.type === "file" ? (
          <FileText className="h-7 w-7 text-primary" />
        ) : (
          <LinkIcon className="h-7 w-7 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground leading-tight truncate">
          {displayTitle}
        </p>
        {doc.type === "url" && (
          <p className="text-sm text-primary truncate mt-0.5">{doc.path}</p>
        )}
        {doc.authors && doc.authors.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {doc.authors.join(", ")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
      </div>

      <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

