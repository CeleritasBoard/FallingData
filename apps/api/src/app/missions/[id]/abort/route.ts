import { createClient, getUser } from "../../../../lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";
import * as z from "zod";
import { headers } from "next/headers";

const MissionAbortSchema = z.object({
  type: z.enum(["USER", "NO_RESPONSE"]),
  reason: z.string(),
});

type JSON_INPUT = z.infer<typeof MissionAbortSchema>;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const headerList = await headers();
  const user = await getUser(supabase, headerList as Headers);

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

  if (
    mission.status !== "SCHEDULED" &&
    mission.status !== "UPLOADED" &&
    mission.status !== "PROCESSING"
  )
    return new Response("Conflict", { status: 409 });

  let header_res = await check_json_header(request);
  if (header_res !== null) return header_res;

  let json: JSON_INPUT | undefined | null = await request.json();

  if (!json) return new Response("Bad request", { status: 400 });

  const parseResult = MissionAbortSchema.safeParse(json);

  if (!parseResult.success)
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
      statusText: "Bad Request",
    });

  json = parseResult.data;
  console.log("Abort type", json.type);

  switch (json.type) {
    case "USER":
      if (mission.status !== "SCHEDULED")
        return new Response("Conflict", { status: 409 });
      const { data: missionCommands, error: missionCommandsError } =
        await supabase
          .from("commands")
          .select("id, mission_id")
          .eq("mission_id", id);
      if (missionCommandsError) {
        console.error(missionCommandsError);
        return new Response("Bad Gateway", { status: 502 });
      }

      try {
        await Promise.all(
          missionCommands.map(async (cmd) => {
            const deleteResp = await fetch(
              `${process.env.NEXT_PUBLIC_HOST}/commands/${cmd.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: headerList.get("Authorization")!,
                },
              },
            );

            if (!deleteResp.ok) throw await deleteResp.text();
          }),
        );
      } catch (e) {
        console.error(e);
        return new Response("Bad Gateway", { status: 502 });
      }

      // unschedule running upload cron job
      break;
    case "NO_RESPONSE":
      if (mission.status == "SCHEDULED")
        return new Response("Conflict", { status: 409 });
      break;
  }

  const { error: missionUpdateError } = await supabase
    .from("missions")
    .update({
      status: "ABORTED",
      abortInfo: {
        type: json.type,
        reason: json.reason,
        user: user.user.id,
      },
    })
    .eq("id", id);

  if (missionUpdateError) {
    console.error(missionUpdateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}
