import { createClient } from "../../../../lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  let { id: raw_id } = await params;
  let id: number;

  try {
    id = parseInt(raw_id);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  let param_res = await check_param(id, supabase, "missions");
  if (param_res !== null) return param_res;

  let header_res = await check_json_header(request);
  if (header_res !== null) return header_res;

  let json: { packets: number[] } | undefined | null = await request.json();

  if (!json) return new Response("Bad request", { status: 400 });

  if (!json.packets || !Array.isArray(json.packets))
    return new Response("Bad request", { status: 400 });

  const { error } = await supabase
    .from("packets")
    .update({ mission_id: id })
    .in("id", json.packets);

  if (error) return new Response("Bad Gateway", { status: 502 });

  return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}
