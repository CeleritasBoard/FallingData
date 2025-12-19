import { createClient } from "../../../lib/supabase/server";
import { headers } from "next/headers";
import { Enums } from "@repo/supabase/database.types";
import { OnionSatDevice } from "@repo/device-comm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: number }> },
) {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user.user)
    return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const headerList = await headers();

  if (
    !(
      headerList.has("Content-Type") &&
      headerList.get("Content-Type") === "application/json"
    )
  )
    return new Response("Unsupported media", { status: 415 });

  const json: { date: number } | null | undefined = await request.json();

  if (!json || !json.date || json.date * 1000 <= Date.now())
    return new Response("Bad Request", { status: 400 });

  const { error, data } = await supabase
    .from("commands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data || error) return new Response("Command not found", { status: 404 });
  if (data.state !== "CREATED")
    return new Response("Command already executed", { status: 409 });

  const device = new OnionSatDevice(supabase);
  await device.init();

  if (!(await device.sendCMD(data.command, json.date / 1000))) {
    console.error("Failed to send command");
    return new Response("Bad Gateway", { status: 502 });
  }

  // Workaround for getting the queue ID: get the last command in the queue
  const cmd_queue = await device.getCMDQueue(Date.now() / 1000 - 1, null);

  if (cmd_queue.commandqueue.length === 0) {
    console.error("Command queue empty");
    return new Response("Bad Gateway", { status: 502 });
  }
  const lastCommand = cmd_queue.commandqueue[cmd_queue.commandqueue.length - 1];

  const { error: updateError } = await supabase
    .from("commands")
    .update({
      state: "SCHEDULED",
      queue_id: lastCommand.command_id,
      execution_time: new Date(json.date).toISOString(),
    })
    .eq("id", id);
  if (updateError) {
    console.error(updateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  const execDate = new Date(json.date);
  const { error: scheduleError } = await supabase.rpc("schedule_command", {
    id: id,
    cron_time: `${execDate.getMinutes()} ${execDate.getHours()} ${execDate.getDate()} ${execDate.getMonth() + 1} *`,
  });

  if (scheduleError) {
    console.error(scheduleError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(
    JSON.stringify({ message: "Command updated successfully" }),
    { status: 200 },
  );
}
