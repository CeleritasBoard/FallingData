import { headers } from "next/headers";
import { createClient } from "../../../../lib/supabase/server";
import { check_json_header, check_param } from "@/lib/checks";
import { schedule_cron } from "@/lib/cron";

type JSON_INPUT = { date: number };

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
    .select(
      "status, device, settings, mission_settings (id, type, is_okay, is_header, continue_with_full_channel, duration, min_voltage, max_voltage, samples, resolution)",
    )
    .eq("id", id)
    .single();

  if (missionQueryError) {
    console.error(missionQueryError);
    return new Response("Bad Gateway", { status: 502 });
  }

  if (mission.status !== "CREATED")
    return new Response("Conflict", { status: 409 });
  if (mission.device == "SLOTH")
    return new Response("Conflict", { status: 409 }); // only a workaround, have to clean up

  let header_res = await check_json_header(request);
  if (header_res !== null) return header_res;
  let json: JSON_INPUT | undefined | null = await request.json();

  if (!json || !json.date) return new Response("Bad request", { status: 400 });

  type CommandData = {
    device: string;
    type: string;
    params: any;
    mission: number;
  };

  const commandData: CommandData[] = [
    {
      device: mission.device as string,
      type: "SET_DURATION",
      mission: id,
      params: {
        // todo: repetitions and breaktime
        repetitions: 1,
        mode: mission.mission_settings.type,
        duration: mission.mission_settings.duration,
        breaktime: 1,
        okaying: mission.mission_settings.is_okay === 1,
      },
    },
    {
      device: mission.device as string,
      type: "SET_SCALE",
      mission: id,
      params: {
        lowerThreshold: mission.mission_settings.min_voltage,
        upperThreshold: mission.mission_settings.max_voltage,
        sample: mission.mission_settings.samples,
        resolution: mission.mission_settings.resolution,
      },
    },
    {
      device: mission.device as string,
      type: "REQUEST_MEASUREMENT",
      mission: id,
      params: {
        timestamp: json.date,
        continue_with_full_channel:
          mission.mission_settings.continue_with_full_channel === 1,
        header_packet: mission.mission_settings.is_header === 1,
      },
    },
  ];

  const headerList = await headers();

  const fetchCommandAPI = async (
    path: string,
    method: "POST" | "PUT",
    body: any,
  ) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/commands${path}`, {
      method: method,
      headers: {
        Authorization: headerList.get("Authorization")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let text = await res.text();
      console.error(text);
      throw { error: text, path, body, method };
    }

    return res.json();
  };

  const createCommand = async (cmd: CommandData) => {
    const create = await fetchCommandAPI("", "PUT", cmd);
    await fetchCommandAPI(`/${create.id}`, "POST", { date: json.date });
    return create.cmd_id;
  };

  const createCommands = async () => {
    try {
      const jobs = await Promise.all(
        commandData.map((cmd) => createCommand(cmd)),
      );
      return jobs.toSorted()[0];
    } catch (e) {
      console.error(e);
      return new Response("Bad Gateway!", { status: 502 });
    }
  };

  const startCommand = await createCommands();
  if (startCommand instanceof Response) return startCommand;

  const { error: settingUpdateError } = await supabase
    .from("mission_settings")
    .update({
      start_command_id: startCommand as number,
    })
    .eq("id", mission.mission_settings.id);

  if (settingUpdateError) {
    console.error(settingUpdateError);
    return new Response("Bad Gateway!", { status: 502 });
  }

  const { error: missionUpdateError } = await supabase
    .from("missions")
    .update({
      status: "SCHEDULED",
      execution_time: new Date(json.date * 1000).toISOString(),
    })
    .eq("id", id);

  if (missionUpdateError) {
    console.error(missionUpdateError);
    return new Response("Bad Gateway!", { status: 502 });
  }

  if (
    !(await schedule_cron(id, new Date(json.date * 1000), "mission", supabase))
  )
    return new Response("Bad Gateway", { status: 502 });

  return new Response("OK", { status: 200 });
}
