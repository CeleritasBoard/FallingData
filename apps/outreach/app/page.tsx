import { createClient } from "@/lib/supabase/server";
import { Badge } from "@workspace/ui/components/badge";

export default async function Home() {
  const supa = await createClient();
  const { count: data, error } = await supa
    .from("missions")
    .select("*", { count: "exact" });

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      Welcome tutorial!
      <Badge variant="secondary">Number of missions: {data}</Badge>
    </main>
  );
}
