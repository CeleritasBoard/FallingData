import { decodeHex } from "jsr:@std/encoding/hex";

export interface IPacketDetail {}

export interface IPacketParser {
  parse(packet: Uint8Array): IPacketDetail;
}

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

export function parse_packet(packet: string): {
  packet_type: string;
  data: IPacketDetail | null;
} {
  const data = decodeHex(packet);
  switch (data[14]) {
    case 0xd5:
      return {
        packet_type: "ERROR",
        data: new ErrorPacketParser().parse(data),
      };
    default:
      return { packet_type: "UNKNOWN", data: null };
  }
}
