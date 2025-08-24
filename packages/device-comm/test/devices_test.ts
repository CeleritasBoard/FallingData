import { assertEquals } from "@std/assert";
import OnionsatDevice from "../src/devices/onionsat.ts";

Deno.test("Onionsat Packet Download", async function onionsat_test() {
  let os = new OnionsatDevice();
  await os.init();
  assertEquals(await os.loadData(4, 12), true);
  await os.close();
});
