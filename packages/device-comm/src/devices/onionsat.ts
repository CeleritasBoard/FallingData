import DeviceBase from "./device";
import WebsocketClient from "../ws_client";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  TablesInsert,
  Json,
  Enums,
} from "@repo/supabase/database.types";
import {
  IHunityPacketResponse,
  IHunityPacket,
  parse_packet,
} from "../packet_parser";

import { validate_checksum, generateCommand } from "../command_gen";

export default class OnionSatDevice extends DeviceBase {
  protected server_link: string;
  protected exp_id: string;
  protected device_name: string;
  protected conn: WebsocketClient;
  protected supabase: any;

  constructor(supabase: any) {
    super();
    this.server_link = "ws://gru.onionsat.com:8080/";
    this.exp_id = "celeritas";
    this.device_name = "ONIONSAT";
    this.conn = new WebsocketClient(this.server_link);
    this.supabase = supabase;
  }

  override async init(): Promise<boolean> {
    await this.conn.read();
    return await super.init();
  }

  async loadData(start: number | null, end: number | null): Promise<boolean> {
    if (this.inited) {
      if (start == null) {
        start = 1;
      }
      if (end == null) {
        end = Math.floor(Date.now() / 1000);
      }

      let raw_packets: IHunityPacket[] = [];

      const fetchData = async (startDate: number, endDate: number) => {
        const message: string = await this.conn.execCmd("getEXPData", [
          this.exp_id,
          startDate.toString(),
          endDate.toString(),
        ]);
        try {
          let data: IHunityPacketResponse = JSON.parse(message);
          raw_packets = raw_packets.concat(data.datas.celeritas);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          console.error("Message:", message);
        }
      };

      let endDate = start;
      console.log("Started fetching data");
      do {
        endDate += 7 * 24 * 3600;
        await fetchData(start, endDate);
        start = endDate;
      } while (endDate < end);

      console.log("Finished fetching data");

      let parsed_packets: TablesInsert<"packets">[] = raw_packets
        .map((packet) => {
          if (packet.data == null) {
            return null;
          }
          let details = parse_packet(packet.data);
          return {
            date: new Date(packet.unixtimestamp * 1000).toISOString(),
            packet: packet.data,
            type: details.packet_type,
            device: "ONIONSAT_TEST" as Enums<"device">,
            details: details.data as Json,
          };
        })
        .filter((packet) => packet != null);

      console.log("parsed_packets", parsed_packets.length);

      const insert = async (offset: number, block_size: number) => {
        let end = offset + block_size;
        let insert_size =
          end > parsed_packets.length ? parsed_packets.length : end;
        const { error } = await this.supabase
          .from("packets")
          .insert(parsed_packets.slice(offset, insert_size));
        if (error) {
          console.error(error);
          throw new Error("Failed to insert packets");
        }
        console.log(`Insertion from ${offset} to ${insert_size} completed`);
      };

      for (let i = 0; i < parsed_packets.length; i += 30000) {
        await insert(i, 30000);
      }
    }
    return true;
  }

  async sendCMD(cmd: string, execTime: number): Promise<boolean> {
    if (cmd.length !== 16) throw new Error("Wrong command length");

    if (!validate_checksum(cmd)) throw new Error("Wrong checksum");

    const message = await this.conn.execCmd("sendCommand", [
      "celeritas",
      cmd,
      execTime.toString(),
    ]);
    if (message !== "Command sent")
      throw new Error("Failed to send command. Response: " + message);
    return true;
  }
}
