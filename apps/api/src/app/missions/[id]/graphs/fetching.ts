export async function handleMissionGraphFetching(supabase: any, id: number) {
  const { data, error } = await supabase
    .from("graphs")
    .select("id, type, description, featured, published, data")
    .eq("mission", id);
  if (error) return new Response("Bad Gateway", { status: 502 });
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
