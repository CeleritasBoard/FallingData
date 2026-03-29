export async function handleMissionGraphFetching(supabase: any, id: number) {
  let { data, error } = await supabase
    .from("graphs")
    .select("id, type, description, featured, published, data")
    .eq("mission", id);
  if (error) return new Response("Bad Gateway", { status: 502 });

  const processedData = await Promise.all(
    data.map(async (graph) => {
      if (graph.type === "spectrum") {
        const packets = await supabase
          .from("packets")
          .select("id, packet, mission_id")
          .in("id", graph.data.packets)
          .order("id", { ascending: true });
        if (packets.error) throw packets.error;
        return {
          ...graph,
          data: { ...graph.data, packets: packets.data.map((p) => p.packet) },
        };
      }
      return graph;
    }),
  );

  return new Response(JSON.stringify(processedData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
