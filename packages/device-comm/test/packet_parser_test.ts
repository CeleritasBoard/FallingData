import { assertEquals } from "@std/assert";
import * as Packets from "../src/packet_parser.ts";

Deno.test("Error packet parsing", async function error_packet() {
  const data = "01000000000000000000000000fbd510";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assertEquals(result.packet_type, "ERROR");
  assertEquals(result.data != null, true);
  let error_packet = result.data as Packets.IErrorPacketDetail;
  assertEquals(error_packet.error_type, "MEASUREMENT");
  assertEquals(error_packet.cmd_id, 1);
});
