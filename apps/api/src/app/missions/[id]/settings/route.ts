import { createClient } from "../../../../lib/supabase/server";
import { Constants } from "@repo/supabase/database.types";
import { check_json_header, check_param } from "@/lib/checks";
import * as z from "zod";

const boolToSmallint = z.boolean().transform((b) => (b ? 1 : 0));

const MissionSettingEditSchema = z.object({
  type: z.enum(["MAX_HITS", "MAX_TIME"], { error: "Invalid type" }),
  is_okay: boolToSmallint,
  is_header: boolToSmallint,
  continue_with_full_channel: boolToSmallint,
  duration: z
    .number({ error: "Duration setting should be a number" })
    .min(0, { error: "Duration must be bigger than 0" })
    .max(65536, { error: "Duration must be less than 65536" }),
  min_voltage: z
    .number({ error: "Min voltage should be a number" })
    .min(0, { error: "Min voltage must be bigger than 0" })
    .max(4096, { error: "Min voltage must be less than 4096" }),
  max_voltage: z
    .number({ error: "Max voltage should be a number" })
    .min(0, { error: "Max voltage must be bigger than 0" })
    .max(4096, { error: "Max voltage must be less than 4096" }),
  samples: z
    .number({ error: "Samples should be a number" })
    .min(0, { error: "Samples must be bigger than 0" })
    .max(256, { error: "Samples must be less than 256" }),
  resolution: z
    .number({ error: "Resolution should be a number" })
    .min(0, { error: "Resolution must be bigger than 0" })
    .lte(1024, { error: "Resolution must be less or equal than 1024" })
    .refine((val) => (val & (val - 1)) == 0, {
      error: "Resolution must be a power of two",
    }),
});

type JSON_INPUT = z.infer<typeof MissionSettingEditSchema>;

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

  const parseResult = MissionSettingEditSchema.safeParse(json);

  if (!parseResult.success)
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
      statusText: "Bad Request",
    });

  json = parseResult.data;

  const { data: mission, error: missionQueryError } = await supabase
    .from("missions")
    .select()
    .eq("id", id)
    .single();

  if (missionQueryError) {
    console.error(missionQueryError);
    return new Response("Bad Gateway", { status: 502 });
  }

  const { data, error: updateError } = await supabase
    .from("mission_settings")
    .update(json)
    .eq("id", mission.settings)
    .select();

  if (updateError) {
    console.error(updateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
