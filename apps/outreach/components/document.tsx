import { createClient } from "@/lib/supabase/server";
import { Download, ExternalLink } from "lucide-react";

type Document = {
  id: number;
  path: string;
  title: string | null;
  authors: string[] | null;
  date: string;
  type: "file" | "url" | "link";
  uploader: string | null;
};

interface DocumentItemProps {
  doc: Document;
}

export async function DocumentItem({ doc }: DocumentItemProps) {
  let url: string;

  const isFile = doc.type === "file";

  if (isFile) {
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
    (doc.type === "file" ? (doc.path.split("/").pop() ?? doc.path) : doc.path);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-[#a9a9a9] bg-[#bdbdbd] px-4 py-3 text-left transition-colors hover:bg-[#c5c5c5] min-h-[110px]"
    >
      <div className="space-y-1">
        <p className="text-lg font-semibold leading-snug text-[#111111]">
          {displayTitle}
        </p>
        <p className="text-sm text-[#2f2f2f] min-h-[18px]">
          {doc.authors && doc.authors.length > 0
            ? doc.authors.join(", ")
            : "\u00A0"}
        </p>
        <p className="text-xs text-[#2f2f2f] min-h-[16px]">
          {formattedDate || "\u00A0"}
        </p>
      </div>
      <span className="mt-3 inline-flex w-fit items-center gap-2 rounded bg-[#f3c400] px-2.5 py-1 text-xs font-semibold text-[#1b1b1b]">
        {isFile ? (
          <Download className="h-4 w-4" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {isFile ? "Letöltés" : "Megnyitás"}
      </span>
    </a>
  );
}
