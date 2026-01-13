import { createClient, getUser } from "../../../lib/supabase/server";
import { headers } from "next/headers";
import { Enums } from "@repo/supabase/database.types";
import { OnionSatDevice } from "@repo/device-comm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const user = await getUser(supabase, (await headers()) as Headers);

  if (!user.user) return new Response("Unauthorized", { status: 401 });

  let { id: raw_id } = await params;
  let id: number;

  try {
    id = parseInt(raw_id);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }
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

  const execDate = new Date(json.date + 60000);
  console.log(execDate.toISOString());
  const { error: scheduleError } = await supabase.rpc("schedule_command", {
    id: id,
    cron_time: `${execDate.getMinutes()} ${execDate.getUTCHours()} ${execDate.getDate()} ${execDate.getMonth() + 1} *`,
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const user = await getUser(supabase, (await headers()) as Headers);

  if (!user.user) return new Response("Unauthorized", { status: 401 });

  const { id: raw_id } = await params;
  let id: number;

  try {
    id = parseInt(raw_id);
  } catch (error) {
    return new Response("Invalid ID", { status: 400 });
  }

  const { error, data } = await supabase
    .from("commands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data || error) return new Response("Command not found", { status: 404 });

  if (data.state !== "CREATED" && data.state !== "SCHEDULED")
    return new Response("Command already executed", { status: 409 });

  if (data.state == "SCHEDULED") {
    const device = new OnionSatDevice(supabase);
    try {
      await device.init();
      await device.deleteCommand(id);
    } catch (error) {
      console.error(error);
      return new Response("Bad Gateway", { status: 502 });
    } finally {
      await device.close();
    }
  }

  const { error: updateError } = await supabase
    .from("commands")
    .update({
      state: "DELETED",
      deleted_by: user.user.id,
    })
    .eq("id", id);
  if (updateError) {
    console.error(updateError);
    return new Response("Bad Gateway", { status: 502 });
  }

  return new Response(
    JSON.stringify({ message: "Command deleted successfully" }),
    { status: 200 },
  );
}
