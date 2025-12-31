import { expect, test } from "vitest";
import OnionsatDevice from "../src/devices/onionsat.ts";
import { generateCommand } from "../src/command_gen.ts";
import { createClient } from "@supabase/supabase-js";
import { SlothDevice } from "../src/devices/sloth.ts";
import * as fs from "node:fs";
import * as path from "node:path";

test("Onionsat Packet Download", async function onionsat_test() {
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

test("Onionsat Command Send", async function onionsat_send() {
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

  const command = {
    type: "FORCE_STATUS_REPORT",
    id: 5,
    params: {},
  };

  let os = new OnionsatDevice(client);
  await os.init();
  expect(
    await os.sendCMD(generateCommand(command), Date.now() / 1000 + 600),
  ).toBe(true);
  await os.close();
});

test("Onionsat Delete Command", async function onionsat_send() {
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

  const command = generateCommand({
    type: "FORCE_STATUS_REPORT",
    id: 5,
    params: {},
  });

  let os = new OnionsatDevice(client);
  await os.init();
  expect(await os.sendCMD(command, Date.now() / 1000 + 600)).toBe(true);

  let { commandqueue } = await os.getCMDQueue(null, null);
  expect(commandqueue[commandqueue.length - 1].data).toBe(command);

  expect(
    await os.deleteCommand(commandqueue[commandqueue.length - 1].command_id),
  ).toBe(true);

  await os.close();
});

test("Sloth import", async () => {
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

  const sloth = new SlothDevice(client);

  const file = fs.readFileSync(path.resolve(__dirname, "res/test.cel"), "utf8");
  await sloth.loadFile(file, new Date());
});
