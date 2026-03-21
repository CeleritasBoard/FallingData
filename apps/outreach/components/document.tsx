import { createClient } from "@/lib/supabase/server";
import { FileText, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";

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

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center gap-4 py-4">
          {doc.type === "file" ? (
            <FileText className="h-10 w-10 text-primary flex-shrink-0" />
          ) : (
            <LinkIcon className="h-10 w-10 text-primary flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {doc.title ?? url}
            </p>
            {doc.authors && doc.authors.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {doc.authors.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            {doc.type === "url" && (
              <p className="text-xs text-muted-foreground truncate">
                {doc.path}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
