import DeviceBase from "./device.ts";
import WebsocketClient from "../ws_client.ts";
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database, TableInsert } from "@repo/supabase/database.types.ts";
import { IHunityPacketResponse, parse_packet } from "../packet_parser.ts";

export default class OnionSatDevice extends DeviceBase {
  protected server_link: string;
  protected exp_id: string;
  protected device_name: string;
  protected conn: WebsocketClient;
  protected supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
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
    let result: boolean = false;
    if (this.inited) {
      if (start == null) {
        start = 1;
      }
      if (end == null) {
        end = Math.floor(Date.now() / 1000);
      }
      const message: string = await this.conn.execCmd("getEXPData", [
        this.exp_id,
        start.toString(),
        end.toString(),
      ]);
      console.log("sending data. Message: " + message);

      let data: IHunityPacketResponse = JSON.parse(message);
      let parsed_packets: TableInsert<"packets">[] = data.datas.celeritas.map(
        (packet) => {
          let details = parse_packet(packet.data);
          return {
            date: packet.unixtimestamp,
            packet: packet.data,
            type: details.packet_type,
            device: "ONIONSAT",
            details: details.data,
          };
        },
      );

      const { error } = await this.supabase
        .from("packets")
        .insert(parsed_packets);
      if (error) {
        console.error("Error inserting packets:", error);
        result = false;
      } else result = true;
    }
    return result;
  }

  async sendCMD(cmd: string): Promise<boolean> {
    return false;
  }
}
