import { Enums } from "@repo/supabase/database.types.ts";

/*    PACKET DETAIL PARSING    */

// Base interface declaration

/**
 * Base type of all packet details
 */
export interface IPacketDetail {}

/**
 * Base type of all parsers
 */
export interface IPacketParser<T extends IPacketDetail> {
  parse(packet: Uint8Array): T;
  format(details: T): string[][];
}

/**
 * The run state of Celeritas
 * See the reference section 7.4 (page 11)
 */
export type CeleritasStatus =
  | "SLEEP"
  | "IDLE"
  | "STARTING"
  | "RUNNING"
  | "FINISHED";

// Util methods

/**
 * Converts a four byte value to a number. The name is because it's usually used to parse time.
 * @param packet the packet to parse as an array of bytes
 * @param offset the offset to start parsing from
 * @returns the parsed 4-byte value as a number
 */
function time_parse(packet: Uint8Array, offset: number = 4): number {
  const time = packet.slice(offset, offset + 4);
  return (time[0] << 24) | (time[1] << 16) | (time[2] << 8) | time[3];
}

/**
 * Converts a three byte value to two 12-bit voltage values.
 * @param packet the packet to parse as an array of bytes
 * @param offset the offset to start parsing from
 * @returns the first 12-bit voltage as `min` and the second as `max`
 */
function volt_range_parse(
  packet: Uint8Array,
  offset: number,
): { min: number; max: number } {
  const voltRange = packet.slice(offset, offset + 3);
  const min = (voltRange[0] << 4) | (voltRange[1] >> 4);
  const max = (((voltRange[1] << 4) & 0xff) << 4) | voltRange[2];
  return { min, max };
}

/**
 * Converts a number into a `CeleritasStatus`
 * @param status_byte the numeric representation of the status
 * @returns the corresponding `CeleritasStatus`
 * @throws Error if the status is invalid
 */
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

/**
 * Type for different error packet types
 */
export type ErrorPacketType =
  | "UNKNOWN_COMMAND"
  | "TERMINATED"
  | "TIMEOUT"
  | "CORRUPTED"
  | "MEASUREMENT"
  | "I2C_QUEUE_FULL"
  | "REQUEST_QUEUE_FULL"
  | "REQUEST_QUEUE_SORT";

/**
 * Data holder of different error packets (reference section 7.9.8)
 */
export interface IErrorPacketDetail extends IPacketDetail {
  cmd_id: number;
  error_type: ErrorPacketType;
}

export class ErrorPacketParser implements IPacketParser<IErrorPacketDetail> {
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

  format(details: IErrorPacketDetail): string[][] {
    return [
      ["ID", details.cmd_id.toString()],
      ["Type", details.error_type],
    ];
  }
}

/**
 * Data holder to the header packet type (reference section 7.9.2)
 */
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

export class HeaderPacketParser implements IPacketParser<IHeaderPacketDetail> {
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

  format(details: IHeaderPacketDetail): string[][] {
    return [
      ["ID", details.cmd_id.toString()],
      ["Interruptok száma", details.interrupt_count.toString()],
      ["Kezdés hőmérséklete", details.temp_start.toString()],
      ["Befejezés hőmérséklete", details.temp_end.toString()],
      ["Befejezés időpontja", details.finish_time.toString()],
      ["Packetszám", details.packet_count.toString()],
      ["Alsó mérési küszöb", details.min_threshold.toString()],
      ["Felső mérési küszöb", details.max_threshold.toString()],
      ["Referenciafeszültség", details.ref_voltage.toString()],
    ];
  }
}

/**
 * Data holder to the geiger count packet type (reference section 7.9.4)
 */
export interface IGeigerCountPacketDetail extends IPacketDetail {
  peak_number: number; // N
}

export class GeigerPacketParser
  implements IPacketParser<IGeigerCountPacketDetail>
{
  parse(data: Uint8Array): IGeigerCountPacketDetail {
    let peaks = 0;
    for (let peak_id = 8; peak_id < 16; peak_id++) {
      peaks += data[peak_id] * Math.pow(256, 7 - (peak_id - 8));
    }
    return {
      peak_number: peaks,
    };
  }

  format(details: IGeigerCountPacketDetail): string[][] {
    return [["Beütések száma", details.peak_number.toString()]];
  }
}

/**
 * Data holder to the selftest packet type (reference section 7.9.5)
 */
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

export class SelftestPacketParser
  implements IPacketParser<ISelftestPacketDetail>
{
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

  format(details: ISelftestPacketDetail): string[][] {
    return [
      ["Parancs ID", details.cmd_id.toString()],
      ["Hőmérséklet", details.temp.toString()],
      ["Minták száma", details.sample_test.toString()],
      ["Hibás csomagok száma", details.error_packet_count.toString()],
      ["Idő", details.time.toString()],
      ["Következő kérelem ID", details.next_request.toString()],
      ["Következő packet ID", details.next_packet.toString()],
      ["Mentés", details.has_save.toString()],
      ["Sikeres vége", details.successful_finish.toString()],
      ["Referencia volt", details.ref_voltage.toString()],
      ["Teszt mérés", details.test_measurement.toString()],
    ];
  }
}

/**
 * Data holder to the default status report packet type (reference section 7.9.6)
 */
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

export class DefaultStatusReportPacketParser
  implements IPacketParser<IDefaultStatusReportPacketDetail>
{
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

  format(details: IDefaultStatusReportPacketDetail): string[][] {
    return [
      ["Státusz", details.status.toString()],
      ["Idő", details.time.toString()],
      ["Packetek száma", details.peak_counter.toString()],
      ["Queue eleje (index)", details.cursor_head.toString()],
      ["Queue vége (index)", details.cursor_tail.toString()],
      ["Hőmérséklet", details.temp.toString()],
      [
        "Aktuális mérés ID",
        details.current_measurement_id?.toString() ?? "None",
      ],
      ["Interruptok száma", details.interrupt_count.toString()],
    ];
  }
}

/**
 * Data holder to the forced status report packet type (reference section 7.9.7)
 */
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

export class ForcedStatusReportPacketParser
  implements IPacketParser<IForcedStatusReportPacketDetail>
{
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

  format(details: IForcedStatusReportPacketDetail): string[][] {
    return [[]];
  }
}

/**
 * Parses a string input into one of the supported packet types.
 * @param packet a raw string coming from the device
 * @returns an object containing the packet type and the parsed data
 *  The parsed data might be null if the packet type is WELCOME or SPECTRUM.
 */
export function parse_packet(packet: string): {
  packet_type: Enums<"packettype">;
  data: IPacketDetail | null;
} {
  try {
    const data = new Uint8Array(Buffer.from(packet, "hex"));
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
  } catch (e) {
    console.error("Falied to decode hex", packet);
    throw e;
  }
}

/* PACKET (AS A WHOLE) PARSING */

export interface IHunityPacket {
  unixtimestamp: number;
  data: string;
}

export interface IHunityPacketResponse {
  datas: { celeritas: IHunityPacket[] };
}

/* PACKET FORMATTING */

/**
 * Format a packet into a string representation.
 * @param packet The packet to format.
 * @returns The formatted packet.
 */
export function formatPacketDetailTable(
  type: Enums<"packettype">,
  packet_details: IPacketDetail,
): string[][] {
  switch (type) {
    case "ERROR":
      return new ErrorPacketParser().format(
        packet_details as IErrorPacketDetail,
      );
    case "HEADER":
      return new HeaderPacketParser().format(
        packet_details as IHeaderPacketDetail,
      );
    case "GEIGER_COUNT":
      return new GeigerPacketParser().format(
        packet_details as IGeigerCountPacketDetail,
      );
    case "SELFTEST":
      return new SelftestPacketParser().format(
        packet_details as ISelftestPacketDetail,
      );
    case "DEFAULT_STATUS_REPORT":
      return new DefaultStatusReportPacketParser().format(
        packet_details as IDefaultStatusReportPacketDetail,
      );
    case "FORCED_STATUS_REPORT":
      return new ForcedStatusReportPacketParser().format(
        packet_details as IForcedStatusReportPacketDetail,
      );
    default:
      return [
        ["Type", "UNKNOWN"],
        ["No", "Data"],
      ];
  }
}
