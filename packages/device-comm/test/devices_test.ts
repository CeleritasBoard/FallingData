import { assertEquals } from "@std/assert";
import OnionsatDevice from "../src/devices/onionsat.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.test("Onionsat Packet Download", async function onionsat_test() {
  let client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_KEY")!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  let os = new OnionsatDevice(client);
  await os.init();
  assertEquals(await os.loadData(4, 12), true);
  await os.close();
});
