import { createClient } from "@/lib/supabase/server";
import { DocumentItem } from "@/components/document";

export default async function DocumentsPage() {
  const supa = await createClient();
  const { data: documents, error } = await supa
    .from("documents")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Dokumentumok</h1>
      {!documents || documents.length === 0 ? (
        <p className="text-muted-foreground">Nincsenek dokumentumok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
