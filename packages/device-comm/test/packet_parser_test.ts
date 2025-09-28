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

Deno.test("Header packet parsing", async function error_packet() {
  const data = "0E0001250000016E400BAFFF0CF5FF2F";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assertEquals(result.packet_type, "HEADER");
  assertEquals(result.data != null, true);
  let header = result.data as Packets.IHeaderPacketDetail;
  assertEquals(header.cmd_id, 14);
  assertEquals(header.interrupt_count, 0);
  assertEquals(header.temp_start, 1);
  assertEquals(header.temp_end, 37);
  assertEquals(header.finish_time, 366);
  assertEquals(header.packet_count, 64);
  assertEquals(header.min_threshold, 186);
  assertEquals(header.max_threshold, 4095);
  assertEquals(header.ref_voltage, 3317);
});

Deno.test("Geiger count packet parsing", async function error_packet() {
  const data = "00AA0000000000000000000043274320";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assertEquals(result.packet_type, "GEIGER_COUNT");
  assertEquals(result.data != null, true);
  let geiger_count = result.data as Packets.IGeigerCountPacketDetail;
  assertEquals(geiger_count.peak_number, 1126646560);
});

Deno.test("Selftest packet parsing", async function error_packet() {
  const data = "010128000000001F010000D0005EFE19";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assertEquals(result.packet_type, "SELFTEST");
  assertEquals(result.data != null, true);
  let selftest = result.data as Packets.ISelftestPacketDetail;
  assertEquals(selftest.cmd_id, 1);
  assertEquals(selftest.error_packet_count, 0);
  assertEquals(selftest.temp, 1);
  assertEquals(selftest.time, 31);
  assertEquals(selftest.next_request, 1);
  assertEquals(selftest.next_packet, 0);
  assertEquals(selftest.has_save, false);
  assertEquals(selftest.successful_finish, false);
  assertEquals(selftest.ref_voltage, 3328);
  assertEquals(selftest.test_measurement, 94);
});
