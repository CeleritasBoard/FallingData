import { expect, test } from "vitest";
import OnionsatDevice from "../src/devices/onionsat.ts";
import { createClient } from "@supabase/supabase-js";

test("Onionsat Packet Download", async function onionsat_test() {
  console.log(process.env);
  let client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
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
  expect(await os.loadData(4, 12)).toBe(true);
  await os.close();
});
