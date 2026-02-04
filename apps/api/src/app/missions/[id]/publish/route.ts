import { createClient } from "../../../../lib/supabase/server";
import { check_param } from "@/lib/checks";

export async function POST(
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

  const { data: mission, error: missionQueryError } = await supabase
    .from("missions")
    .select()
    .eq("id", id)
    .single();

  if (missionQueryError) {
    console.error(missionQueryError);
    return new Response("Bad Gateway", { status: 502 });
  }

  if (mission.status !== "PROCESSING")
    return new Response("Conflict", { status: 409 });

  const { error: missionUpdateError } = await supabase
    .from("missions")
    .update({
      status: "PUBLISHED",
    })
    .eq("id", id);

  if (missionUpdateError) {
    console.error(missionUpdateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}
