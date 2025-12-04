import { createClient } from "../../lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase/database.types";
import { OnionSatDevice } from "@repo/device-comm";
import { headers } from "next/headers";
import { useState } from "react";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("packets")
      .select()
      .order("date", { ascending: false })
      .limit(1)
      .single();
    if (error) {
      console.log("Error fetching data:", error);
      return new Response(String(error?.message ?? error), { status: 500 });
    }

    const device = new OnionSatDevice(supabase);
    await device.init();
    let startDate = Date.parse(data.date!) / 1000;

    let headerList = await headers();
    if (
      headerList.has("Content-Type") &&
      headerList.get("Content-Type") === "application/json"
    ) {
      let input_json: { startDate: number } | undefined | null =
        await req.json();
      if (
        input_json &&
        input_json.startDate &&
        input_json.startDate >= startDate
      )
        startDate = input_json?.startDate ?? startDate;
    }
    let endDate = startDate + 7 * 24 * 60 * 60; // 1 week
    console.log(`Loading data from ${startDate} until: ${endDate}`);
    await device.loadData(startDate, endDate);

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
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
}
