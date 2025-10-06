import * as Packets from "../src/packet_parser.ts";
import { assert, expect, test } from "vitest";

test("Error packet parsing", function error_packet() {
  const data = "01000000000000000000000000fbd510";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "ERROR");
  assert.equal(result.data != null, true);
  let error_packet = result.data as Packets.IErrorPacketDetail;
  assert.equal(error_packet.error_type, "MEASUREMENT");
  assert.equal(error_packet.cmd_id, 1);

  let format = Packets.formatPacketDetailTable(
    result.packet_type,
    error_packet,
  );
  assert.deepEqual(format, [
    ["ID", error_packet.cmd_id.toString()],
    ["Type", error_packet.error_type],
  ]);
});

test("Header packet parsing", async function header_packet() {
  const data = "0E0001250000016E400BAFFF0CF5FF2F";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "HEADER");
  assert.equal(result.data != null, true);
  let header = result.data as Packets.IHeaderPacketDetail;
  assert.equal(header.cmd_id, 14);
  assert.equal(header.interrupt_count, 0);
  assert.equal(header.temp_start, 1);
  assert.equal(header.temp_end, 37);
  assert.equal(header.finish_time, 366);
  assert.equal(header.packet_count, 64);
  assert.equal(header.min_threshold, 186);
  assert.equal(header.max_threshold, 4095);
  assert.equal(header.ref_voltage, 3317);

  let format = Packets.formatPacketDetailTable(result.packet_type, header);

  assert.deepEqual(format, [
    ["ID", header.cmd_id.toString()],
    ["Interruptok száma", header.interrupt_count.toString()],
    ["Kezdés hőmérséklete", header.temp_start.toString()],
    ["Befejezés hőmérséklete", header.temp_end.toString()],
    ["Befejezés időpontja", header.finish_time.toString()],
    ["Packetszám", header.packet_count.toString()],
    ["Alsó mérési küszöb", header.min_threshold.toString()],
    ["Felső mérési küszöb", header.max_threshold.toString()],
    ["Referenciafeszültség", header.ref_voltage.toString()],
  ]);
});

test("Geiger count packet parsing", async function geiger_count_packet() {
  const data = "00AA0000000000000000000043274320";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "GEIGER_COUNT");
  assert.equal(result.data != null, true);
  let geiger_count = result.data as Packets.IGeigerCountPacketDetail;
  assert.equal(geiger_count.peak_number, 1126646560);
});

test("Selftest packet parsing", async function selftest_packet() {
  const data = "010128000000001F010000D0005EFE19";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "SELFTEST");
  assert.equal(result.data != null, true);
  let selftest = result.data as Packets.ISelftestPacketDetail;
  assert.equal(selftest.cmd_id, 1);
  assert.equal(selftest.error_packet_count, 0);
  assert.equal(selftest.temp, 1);
  assert.equal(selftest.time, 31);
  assert.equal(selftest.next_request, 1);
  assert.equal(selftest.next_packet, 0);
  assert.equal(selftest.has_save, false);
  assert.equal(selftest.successful_finish, false);
  assert.equal(selftest.ref_voltage, 3328);
  assert.equal(selftest.test_measurement, 94);
});

test("Default status report packet parsing", async function default_status_report_packet() {
  const data = "02000008DF0000301906062000005517";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "DEFAULT_STATUS_REPORT");
  assert.equal(result.data != null, true);
  let status_report = result.data as Packets.IDefaultStatusReportPacketDetail;
  assert.equal(status_report.status, "IDLE");
  assert.equal(status_report.time, 2271);
  assert.equal(status_report.peak_counter, 12313);
  assert.equal(status_report.cursor_head, 6);
  assert.equal(status_report.cursor_tail, 6);
  assert.equal(status_report.temp, 32);
  assert.equal(status_report.current_measurement_id, 0);
  assert.equal(status_report.interrupt_count, 0);
});

test("Forced status report packet parsing", async function forced_status_report_packet() {
  const data = "0100FF00FF0500050401053036005637";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "FORCED_STATUS_REPORT");
  assert.equal(result.data != null, true);
  let status_report = result.data as Packets.IForcedStatusReportPacketDetail;
  assert.equal(status_report.status, "SLEEP");
  assert.equal(status_report.time, 16711935);
  assert.equal(status_report.temp, 48);
  assert.equal(status_report.packet_cursor_size, 5);
  assert.equal(status_report.packet_cursor_head, 0);
  assert.equal(status_report.packet_cursor_tail, 5);
  assert.equal(status_report.request_cursor_size, 4);
  assert.equal(status_report.request_cursor_head, 1);
  assert.equal(status_report.request_cursor_tail, 5);
  assert.equal(status_report.current_measurement_id, 54);
  assert.equal(status_report.time_to_sleep, 0);
});

test("Welcome packet parsing", async function welcome_packet() {
  const data = "43656C65726974617300000000000000";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "WELCOME");
  assert.equal(result.data, null);
});

test("Spectrum packet parsing", async function spectrum_packet() {
  const data = "00010000000000010000000000000000";
  const result: {
    packet_type: string;
    data: Packets.IPacketDetail | null;
  } = Packets.parse_packet(data);
  assert.equal(result.packet_type, "SPECTRUM");
  assert.equal(result.data, null);
});
