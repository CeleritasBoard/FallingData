import { assertEquals } from "@std/assert";
import WebsocketClient from "../src/ws_client.ts";

Deno.test("Test the infra", async function websocket_test() {
  let client = new WebsocketClient("ws://gru.onionsat.com:8080/");
  assertEquals((await client.read()).startsWith("Hunity GRU WebSocket"), true);
  assertEquals(await client.login("CELERITAS", "121212"), false);
  await client.close();
});
