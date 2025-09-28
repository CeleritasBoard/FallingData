import { decodeHex } from "jsr:@std/encoding/hex";

// Base interface declaration
export interface IPacketDetail {}

export interface IPacketParser {
  parse(packet: Uint8Array): IPacketDetail;
}

export type CeleritasStatus =
  | "SLEEP"
  | "IDLE"
  | "STARTING"
  | "RUNNING"
  | "FINISHED";

// Util methods
function time_parse(packet: Uint8Array, offset: number = 4): number {
  const time = packet.slice(offset, offset + 4);
  return (time[0] << 24) | (time[1] << 16) | (time[2] << 8) | time[3];
}

function volt_range_parse(
  packet: Uint8Array,
  offset: number,
): { min: number; max: number } {
  const voltRange = packet.slice(offset, offset + 3);
  const min = (voltRange[0] << 4) | (voltRange[1] >> 4);
  const max = (((voltRange[1] << 4) & 0xff) << 4) | voltRange[2];
  return { min, max };
}

function status_parse(status_byte: number): CeleritasStatus {
  switch (status_byte) {
    case 0x01:
      return "SLEEP";
    case 0x02:
      return "IDLE";
    case 0x03:
      return "STARTING";
    case 0x04:
      return "RUNNING";
    case 0x05:
      return "FINISHED";
    default:
      throw new Error(`Invalid status byte: ${status_byte}`);
  }
}

// Packet definitions
export type ErrorPacketType =
  | "UNKNOWN_COMMAND"
  | "TERMINATED"
  | "TIMEOUT"
  | "CORRUPTED"
  | "MEASUREMENT"
  | "I2C_QUEUE_FULL"
  | "REQUEST_QUEUE_FULL"
  | "REQUEST_QUEUE_SORT";

export interface IErrorPacketDetail extends IPacketDetail {
  cmd_id: number;
  error_type: ErrorPacketType;
}

export class ErrorPacketParser implements IPacketParser {
  parse(packet: Uint8Array): IErrorPacketDetail {
    const cmdId = packet[0];
    let errorType: ErrorPacketType = "UNKNOWN_COMMAND";
    // For the exact codes see the final reference section 7.9.8 (page 20)
    switch (packet[13]) {
      case 0xf0:
        errorType = "TERMINATED";
        break;
      case 0xfd:
        errorType = "TIMEOUT";
        break;
      case 0xf7:
        errorType = "CORRUPTED";
        break;
      case 0xfb:
        errorType = "MEASUREMENT";
        break;
      case 0xdf:
        errorType = "I2C_QUEUE_FULL";
        break;
      case 0xbf:
        errorType = "REQUEST_QUEUE_FULL";
        break;
      case 0xfc:
        errorType = "REQUEST_QUEUE_SORT";
        break;
      case 0xfe:
      default:
        errorType = "UNKNOWN_COMMAND";
        break;
    }
    return { cmd_id: cmdId, error_type: errorType };
  }
}

export interface IHeaderPacketDetail extends IPacketDetail {
  cmd_id: number; // ID
  interrupt_count: number; // IC
  temp_start: number; // T_1
  temp_end: number; // T_2
  finish_time: number; // UNIX_TIMESTAMP
  packet_count: number; // N (number of packets)
  min_threshold: number; // i
  max_threshold: number; // j
  ref_voltage: number; // U_{ref} - reference voltage
}

export class HeaderPacketParser implements IPacketParser {
  parse(data: Uint8Array): IHeaderPacketDetail {
    const threshold = volt_range_parse(data, 9);
    return {
      cmd_id: data[0],
      interrupt_count: data[1],
      temp_start: data[2],
      temp_end: data[3],
      finish_time: time_parse(data),
      packet_count: data[8],
      min_threshold: threshold.min,
      max_threshold: threshold.max,
      ref_voltage: (data[12] << 8) | data[13],
    };
  }
}

export interface IGeigerCountPacketDetail extends IPacketDetail {
  peak_number: number; // N
}

export class GeigerPacketParser implements IPacketParser {
  parse(data: Uint8Array): IGeigerCountPacketDetail {
    let peaks = 0;
    for (let peak_id = 8; peak_id < 16; peak_id++) {
      peaks += data[peak_id] * Math.pow(256, 7 - (peak_id - 8));
    }
    return {
      peak_number: peaks,
    };
  }
}

export interface ISelftestPacketDetail extends IPacketDetail {
  cmd_id: number; // ID
  temp: number; // T
  sample_test: number; // U_s - a single sample
  error_packet_count: number; // N_{err} - number of error packets in queue
  time: number; // t - UNIX TIMESTAMP
  next_request: number; // R_{next} - id of the next request in queue
  next_packet: number; // P_{next} - id of the next packet in queue
  has_save: boolean; // B
  successful_finish: boolean; // B
  ref_voltage: number; // U_{ref} - reference voltage
  test_measurement: number; // U_L - test measurement
}

export class SelftestPacketParser implements IPacketParser {
  parse(data: Uint8Array): ISelftestPacketDetail {
    const ref_test_voltage = volt_range_parse(data, 11); // reference voltage and test measurement in 3 bytes
    return {
      cmd_id: data[0],
      temp: data[1],
      sample_test: data[2],
      error_packet_count: data[3],
      time: time_parse(data),
      next_request: data[8],
      next_packet: data[9],
      has_save: (data[10] & 1) === 1,
      successful_finish: (data[10] & 2) === 1,
      ref_voltage: ref_test_voltage.min, // first half of the byte 11-13 "range"
      test_measurement: ref_test_voltage.max, // second half of the byte 11-13 "range"
    };
  }
}

export interface IDefaultStatusReportPacketDetail extends IPacketDetail {
  status: CeleritasStatus; // S
  time: number; // t - UNIX TIMESTAMP
  peak_counter: number;
  cursor_head: number;
  cursor_tail: number;
  temp: number; // T
  current_measurement_id: number | null; // ID - null, ha nulla
  interrupt_count: number; // IC
}

export class DefaultStatusReportPacketParser {
  parse(data: Uint8Array): IDefaultStatusReportPacketDetail {
    const time = time_parse(data, 1);
    const peaks = time_parse(data, 5); // used cause time is just a 4 byte long integer
    return {
      status: status_parse(data[0]),
      time,
      peak_counter: peaks,
      cursor_head: data[9],
      cursor_tail: data[10],
      temp: data[11],
      current_measurement_id: data[12],
      interrupt_count: data[13],
    };
  }
}

export interface IForcedStatusReportPacketDetail extends IPacketDetail {
  status: CeleritasStatus; // S
  time: number;
  request_cursor_head: number;
  request_cursor_tail: number;
  request_cursor_size: number;
  packet_cursor_head: number;
  packet_cursor_tail: number;
  packet_cursor_size: number;
  temp: number; // T
  current_measurement_id: number | null; // ID - null, ha nulla
  time_to_sleep: number;
}

export class ForcedStatusReportPacketParser implements IPacketParser {
  parse(data: Uint8Array): IForcedStatusReportPacketDetail {
    return {
      status: status_parse(data[0]),
      time: time_parse(data, 1),
      packet_cursor_size: data[5],
      packet_cursor_head: data[6],
      packet_cursor_tail: data[7],
      request_cursor_size: data[8],
      request_cursor_head: data[9],
      request_cursor_tail: data[10],
      temp: data[11],
      current_measurement_id: data[12],
      time_to_sleep: data[13],
    };
  }
}

export function parse_packet(packet: string): {
  packet_type: string;
  data: IPacketDetail | null;
} {
  const data = decodeHex(packet);
  // handling "special" type detection
  if (data[1] === 0xaa && data[2] === 0x00 && data[3] === 0x00) {
    return {
      packet_type: "GEIGER_COUNT",
      data: new GeigerPacketParser().parse(data),
    };
  }
  if (packet === "43656C65726974617300000000000000") {
    return {
      packet_type: "WELCOME",
      data: null,
    };
  }
  // handling "normal" type detection (15th byte is the type indicator)
  switch (data[14]) {
    case 0xd5:
      return {
        packet_type: "ERROR",
        data: new ErrorPacketParser().parse(data),
      };
    case 0xff:
      return {
        packet_type: "HEADER",
        data: new HeaderPacketParser().parse(data),
      };
    case 0xfe:
      return {
        packet_type: "SELFTEST",
        data: new SelftestPacketParser().parse(data),
      };
    case 0x55:
      return {
        packet_type: "DEFAULT_STATUS_REPORT",
        data: new DefaultStatusReportPacketParser().parse(data),
      };
    case 0x56:
      return {
        packet_type: "FORCED_STATUS_REPORT",
        data: new ForcedStatusReportPacketParser().parse(data),
      };
    default:
      return { packet_type: "SPECTRUM", data: null };
  }
}
