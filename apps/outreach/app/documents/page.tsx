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
    <section className="flex-1 bg-[#0b0b0b] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-semibold">
          Dokumentumaink
        </h1>
        {!documents || documents.length === 0 ? (
          <p className="text-center text-sm text-[#c7c7c7]">
            Nincsenek dokumentumok.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {documents.map((doc) => (
              <DocumentItem key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
