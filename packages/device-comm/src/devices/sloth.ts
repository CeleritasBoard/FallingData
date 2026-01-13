import { TablesInsert, Enums, Json } from "@repo/supabase/database.types";
import { parse_packet } from "../packet_parser";

export class SlothDevice {
  private supabase: any;
  private readonly device_name: string = "SLOTH";

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async loadFile(content: string, date: Date): Promise<boolean> {
    try {
      if (content === null || content === undefined) return false;

      // Split into lines and remove empty lines
      const rawLines = content.split(/\r?\n/);
      const lines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);

      const packets: TablesInsert<"packets">[] = [];

      for (const line of lines) {
        // Split by any whitespace (spaces, tabs) and filter out empty tokens
        const parts = line.split(/\s+/).filter((p) => p.length > 0);

        // Expect exactly 16 numbers per line
        if (parts.length !== 16) {
          console.warn(
            `Line does not contain 16 space-separated numbers: "${line}"`,
          );
          return false;
        }

        const packet = parts
          .map((token) => {
            const num = parseInt(token, 10);
            if (Number.isNaN(num)) {
              throw new Error(`Invalid number token "${token}"`);
            }

            // Convert to hex string, uppercase, pad to even length (at least 2 chars)
            let hex = num.toString(16).toUpperCase();
            if (hex.length % 2 !== 0) hex = "0" + hex;
            return hex;
          })
          .join("");

        const { packet_type, data: details } = parse_packet(packet);

        packets.push({
          date: date.toISOString(),
          packet,
          type: packet_type,
          device: "SLOTH" as Enums<"device">,
          details: details as Json,
        });
      }

      const { error } = await this.supabase.from("packets").insert(packets);
      if (error) {
        console.error(error);
        throw new Error("Failed to insert packets");
      }

      return true;
    } catch (err) {
      console.error("Error parsing content:", err);
      return false;
    }
  }
}
