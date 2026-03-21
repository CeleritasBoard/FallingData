import { createClient } from "@/lib/supabase/server";
import { ArrowUpRight, FileText, Link as LinkIcon } from "lucide-react";

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

  const isFile = doc.type === "file";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-stretch rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div
        className={`flex items-center justify-center w-16 flex-shrink-0 ${
          isFile ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-500"
        }`}
      >
        {isFile ? (
          <FileText className="h-8 w-8" />
        ) : (
          <LinkIcon className="h-8 w-8" />
        )}
      </div>

      <div className="flex-1 px-5 py-4 min-w-0">
        <p className="font-semibold text-foreground leading-snug">
          {displayTitle}
        </p>
        {!isFile && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {doc.path}
          </p>
        )}
        {doc.authors && doc.authors.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {doc.authors.join(", ")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <div className="flex items-center pr-5">
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </a>
  );
}

