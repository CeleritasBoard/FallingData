import { createClient } from "../../lib/supabase/server";
import { OnionSatDevice, SlothDevice } from "@repo/device-comm";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    let headerList = await headers();

    if (
      !(
        headerList.has("Content-Type") &&
        headerList.get("Content-Type") === "application/json"
      )
    )
      return new Response("Invalid request", { status: 400 });

    let input_json:
      | {
          startDate?: number;
          device: "ONIONSAT_TEST" | "SLOTH";
          content?: string | null;
        }
      | undefined
      | null = await req.json();

    switch (input_json!.device) {
      case "ONIONSAT_TEST":
        const { data, error } = await supabase
          .from("packets")
          .select()
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.log("Error fetching data:", error);
          return new Response(String(error?.message ?? error), { status: 500 });
        }

        let startDate: number = 0;
        if (
          !(input_json && input_json.startDate && input_json.device) &&
          !(data && data.date)
        ) {
          return new Response(
            JSON.stringify({ state: "error", message: "Invalid input" }),
            {
              headers: { "Content-Type": "application/json" },
              status: 400,
            },
          );
        }

        if (data && data.date) startDate = Date.parse(data!.date!) / 1000;

        if (
          input_json &&
          input_json.startDate &&
          input_json.startDate >= startDate
        )
          startDate = input_json?.startDate ?? startDate;
        const onionsat = new OnionSatDevice(supabase);
        await onionsat.init();
        let endDate = startDate + 7 * 24 * 60 * 60; // 1 week
        console.log(`Loading data from ${startDate} until: ${endDate}`);
        await onionsat.loadData(startDate, endDate);

        if (endDate > Date.now() / 1000) {
          return new Response(JSON.stringify({ state: "finished" }), {
            headers: { "Content-Type": "application/json" },
            status: 201,
          });
        } else {
          return new Response(
            JSON.stringify({ state: "progressing", startDate: endDate }),
            {
              headers: { "Content-Type": "application/json" },
              status: 201,
            },
          );
        }
      case "SLOTH":
        if (!input_json?.content || !input_json?.startDate)
          return new Response("Content is required for a sloth import", {
            status: 400,
          });
        const sloth = new SlothDevice(supabase);
        if (
          !(await sloth.loadFile(
            input_json?.content!,
            new Date(input_json!.startDate! * 1000),
          ))
        )
          return new Response("Failed to import data", { status: 500 });
        return new Response(JSON.stringify({ state: "finished" }), {
          headers: { "Content-Type": "application/json" },
          status: 201,
        });
    }
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
}
