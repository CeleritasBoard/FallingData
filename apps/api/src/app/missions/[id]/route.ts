import { createClient } from "../../../lib/supabase/server";
import { Constants } from "@repo/supabase/database.types";
import { check_json_header, check_param } from "@/lib/checks";
import * as z from "zod";

const MissionEditSchema = z.object({
  name: z.string(),
  device: z.enum(Constants.public.Enums.device),
});

type JSON_INPUT = z.infer<typeof MissionEditSchema>;

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

  let header_res = await check_json_header(request);
  if (header_res !== null) return header_res;

  let json: JSON_INPUT | undefined | null = await request.json();

  if (!json) return new Response("Bad request", { status: 400 });

  const parseResult = MissionEditSchema.safeParse(json);

  if (!parseResult.success)
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
      statusText: "Bad Request",
    });

  json = parseResult.data;

  const { data, error: updateError } = await supabase
    .from("missions")
    .update({
      name: json.name,
      device: json.device,
    })
    .eq("id", id)
    .select();

  if (updateError) {
    console.error(updateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
