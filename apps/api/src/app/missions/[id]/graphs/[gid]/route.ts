import { Json } from "@repo/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";
import { handleMissionGraphFetching } from "../fetching";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; gid: string }> },
) {
  const supabase = await createClient();

  let { id: raw_id, gid: raw_gid } = await params;
  let id: number;
  let graph_id: number;

  try {
    id = parseInt(raw_id);
    graph_id = parseInt(raw_gid);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  let mission_param_res = await check_param(id, supabase, "missions");
  if (mission_param_res !== null) return mission_param_res;
  let graph_param_res = await check_param(graph_id, supabase, "graphs");
  if (graph_param_res !== null) return graph_param_res;

  let content_res = await check_json_header(request);
  if (content_res !== null) return content_res;

  const json: Record<string, unknown> | null | undefined = await request.json();

  if (json === null || json === undefined) {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (
    !Object.hasOwn(json, "description") &&
    !Object.hasOwn(json, "featured") &&
    !Object.hasOwn(json, "published")
  ) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { data, error } = await supabase
    .from("graphs")
    .update(json as Record<string, unknown>)
    .eq("id", graph_id);

  if (error) {
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(null, { status: 204 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; gid: string }> },
) {
  const supabase = await createClient();

  let { id: raw_id, gid: raw_gid } = await params;
  let id: number;
  let graph_id: number;

  try {
    id = parseInt(raw_id);
    graph_id = parseInt(raw_gid);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  let mission_param_res = await check_param(id, supabase, "missions");
  if (mission_param_res !== null) return mission_param_res;
  let graph_param_res = await check_param(graph_id, supabase, "graphs");
  if (graph_param_res !== null) return graph_param_res;

  const { data, error } = await supabase
    .from("graphs")
    .delete()
    .eq("id", graph_id);

  if (error) {
    return new Response("Bad Gateway", { status: 502 });
  }

  return handleMissionGraphFetching(supabase, id);
}
