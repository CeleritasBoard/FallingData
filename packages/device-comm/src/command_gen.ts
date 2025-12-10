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
