import { Json } from "@repo/supabase/database.types";
import { createClient } from "../../../../lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";
import { handleMissionGraphFetching } from "./fetching";

export async function PUT(
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

  let content_res = await check_json_header(request);
  if (content_res !== null) return content_res;

  const json:
    | { type: "custom" | "spectrum"; path?: string }
    | null
    | undefined = await request.json();

  if (json === null || json === undefined) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const getData = async () => {
    if (json.type === "custom") return { file: json.path! };
    if (json.type === "spectrum") {
      const { data: spectrumIDs, error: spectrumError } = await supabase
        .from("packets")
        .select("id")
        .eq("mission_id", id)
        .eq("type", "SPECTRUM");
      if (spectrumError) throw spectrumError;
      return { packets: spectrumIDs.map((packet) => packet.id) };
    }
  };

  try {
    const { error: insertError } = await supabase.from("graphs").insert({
      mission: id,
      type: json.type,
      data: (await getData()) as Json,
    });
    if (insertError) throw insertError;
  } catch (error) {
    console.error(error);
    return new Response("Bad Gateway", { status: 502 });
  }

  return handleMissionGraphFetching(supabase, id);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  let { id: raw_id } = await params;
  let id: number;
  try {
    id = parseInt(raw_id);
  } catch {
    return new Response("Invalid ID", { status: 400 });
  }

  let param_res = await check_param(id, supabase, "missions");
  if (param_res !== null) return param_res;

  return handleMissionGraphFetching(supabase, id);
}
