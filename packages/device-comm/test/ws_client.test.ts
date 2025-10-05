import WebsocketClient from "../src/ws_client.ts";
import { assert, test } from "vitest";

test("Test the infra", async function websocket_test() {
  let client = new WebsocketClient("ws://gru.onionsat.com:8080/");
  assert.equal((await client.read()).startsWith("Hunity GRU WebSocket"), true);
  assert.equal(await client.login("CELERITAS", "121212"), false);
  await client.close();
});
