// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import OnionSatDevice from "@repo/device-comm/devices/onionsat.ts";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );
    const { data, error } = await supabase
      .from("packets")
      .select()
      .order("id", { ascending: false })
      .limit(1)
      .single();
    if (error)
      return new Response(String(error?.message ?? error), { status: 500 });

    const device = new OnionSatDevice(supabase);
    await device.loadData(data.date, null);

    return new Response(null, {
      headers: { "Content-Type": "application/json" },
      status: 204,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
