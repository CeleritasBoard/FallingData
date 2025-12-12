import { Buffer } from "node:buffer";

/// COMMAND BODY GENERATORS

export interface ICommandBody {
  generateBody(): Buffer;
}

export class SetDurationCommandBody {
  repetitions: number;
  mode: "MAX_TIME" | "MAX_HITS";
  duration: number;
  breaktime: number;
  okaying: boolean;

  constructor(
    repetitions: number,
    mode: "MAX_TIME" | "MAX_HITS",
    duration: number,
    breaktime: number,
    okaying: boolean,
  ) {
    this.repetitions = repetitions;
    this.mode = mode;
    this.duration = duration;
    this.breaktime = breaktime;
    this.okaying = okaying;
  }

  generateBody(): Buffer {
    const body = Buffer.alloc(5);
    const rep_md_ok_byte: number =
      (this.repetitions << 2) |
      ((this.mode === "MAX_TIME" ? 0 : 1) << 1) |
      (this.okaying ? 1 : 0);
    console.log(rep_md_ok_byte);
    body.writeUInt8(rep_md_ok_byte, 0);
    body.writeUInt16BE(this.duration, 1);
    body.writeUInt16BE(this.breaktime, 3);
    return body;
  }
}

export class SetScaleCommandBody implements ICommandBody {
  constructor(
    public readonly lowerThreshold: number,
    public readonly upperThreshold: number,
    public readonly resolution: number,
    public readonly sample: number,
  ) {
    this.lowerThreshold = Math.floor((lowerThreshold / 3300) * 4095);
    this.upperThreshold = Math.floor((upperThreshold / 3300) * 4095);
  }

  generateBody(): Buffer {
    const body = Buffer.alloc(5);
    body.writeUInt8(this.lowerThreshold >> 4, 0);
    console.log(this.lowerThreshold, this.upperThreshold);
    body.writeUInt8(
      ((this.lowerThreshold & 0xf) << 4) | (this.upperThreshold >> 8),
      1,
    );
    body.writeUInt8(this.upperThreshold & 0xff, 2);
    body.writeUInt8(this.resolution / 8, 3);
    body.writeUInt8(this.sample, 4);
    return body;
  }
}

export class RequestMeasurementCommandBody implements ICommandBody {
  constructor(
    public readonly timestamp: number,
    public readonly continue_with_full_channel: boolean,
    public readonly header_packet: boolean,
  ) {}

  generateBody(): Buffer {
    const body = Buffer.alloc(5);
    body.writeUint32LE(this.timestamp, 0);
    body.writeUint8(
      ((this.continue_with_full_channel ? 1 : 0) << 7) |
        ((this.header_packet ? 1 : 0) << 6),
      4,
    );
    return body;
  }
}

export class RequestSelftestCommandBody implements ICommandBody {
  constructor(public readonly timestamp: number) {}

  generateBody(): Buffer {
    const body = Buffer.alloc(5);
    body.writeUint32LE(this.timestamp, 0);
    body.writeUint8(0, 4);
    return body;
  }
}

/// COMMAND GENERATION

export interface IRawCommand {
  id: number;
  type: string;
  params: any;
}

type CommandRegistryItem = {
  typeCode: number;
  bodyGenerator: (data: any) => ICommandBody;
};

const commandRegistry: Record<string, CommandRegistryItem> = {
  SET_DURATION: {
    typeCode: 0xe0,
    bodyGenerator: (data: any) =>
      new SetDurationCommandBody(
        data.repetitions,
        data.mode,
        data.duration,
        data.breaktime,
        data.okaying,
      ),
  },
  SET_SCALE: {
    typeCode: 0xd0,
    bodyGenerator: (data: any) =>
      new SetScaleCommandBody(
        data.lowerThreshold,
        data.upperThreshold,
        data.resolution,
        data.sample,
      ),
  },
  REQUEST_MEASUREMENT: {
    typeCode: 0x07,
    bodyGenerator: (data: any) =>
      new RequestMeasurementCommandBody(
        data.timestamp,
        data.continue_with_full_channel,
        data.header_packet,
      ),
  },
  REQUEST_SELFTEST: {
    typeCode: 0x06,
    bodyGenerator: (data: any) =>
      new RequestSelftestCommandBody(data.timestamp),
  },
};

export function generate_checksum(command: Buffer): number {
  let count = 0;
  let temp = 0;

  for (let i = 0; i < 7; i++) {
    temp = command.readUInt8(i);
    while (temp > 0) {
      temp &= temp - 1;
      count++;
    }
  }

  return count;
}

export function generateCommand(raw_command: IRawCommand): string {
  const commandGenerator = commandRegistry[raw_command.type];
  if (!commandGenerator) {
    throw new Error(`Unknown command type: ${raw_command.type}`);
  }
  const body = commandGenerator
    .bodyGenerator(raw_command.params)
    .generateBody();
  const header = Buffer.alloc(2); // the first two byte of command
  header.writeUInt8(commandGenerator.typeCode, 0);
  header.writeUInt8(raw_command.id, 1);
  const checksum = generate_checksum(Buffer.concat([header, body]));
  return Buffer.concat([header, body, Buffer.from([checksum])])
    .toString("hex")
    .toUpperCase();
}
