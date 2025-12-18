import { createClient } from "../../lib/supabase/server";
import { headers } from "next/headers";
import { validateParams, generateCommand } from "@repo/device-comm";
import { Enums } from "@repo/supabase/database.types";

type JSON_INPUT = {
  device: "ONIONSAT_TEST" | "BME_HUNITY";
  execDate?: number | undefined;
  type: string;
  params: any;
};

export async function PUT(req: Request) {
  try {
    const supa = await createClient();
    const { data: user_data, error: auth_error } = await supa.auth.getUser();

    if (auth_error || !user_data.user)
      return new Response("Unauthorized", { status: 401 });

    const headerList = await headers();
    if (
      !(
        headerList.has("Content-Type") &&
        headerList.get("Content-Type") === "application/json"
      )
    )
      return new Response("Unsupported media", { status: 415 });

    let json: JSON_INPUT | undefined | null = await req.json();

    if (!json || !json.device || !json.type || !json.params)
      return new Response("Bad request", { status: 400 });

    const validation = validateParams(json.type, json.params);
    if (validation !== true)
      return new Response("Invalid params: " + validation, { status: 400 });

    const { data: command, error } = await supa
      .from("commands")
      .select("cmd_id")
      .eq("cmd_device", json.device)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return new Response("Error fetching command", { status: 502 });
    }
    let next_id = command ? command.cmd_id + 1 : 1;
    if (next_id > 255) next_id = 1;

    const cmd = generateCommand({ id: next_id, ...json });

    const { data: insertedCommand, error: insertError } = await supa
      .from("commands")
      .insert({
        cmd_device: json.device as Enums<"device">,
        type: json.type as Enums<"commandtype">,
        params: json.params,
        cmd_id: next_id,
        execution_time: null,
        command: cmd,
        user_id: user_data.user.id,
      })
      .select();

    if (insertError) {
      console.error(insertError);
      return new Response("Error inserting command", { status: 502 });
    }

    return new Response(JSON.stringify(insertedCommand), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
