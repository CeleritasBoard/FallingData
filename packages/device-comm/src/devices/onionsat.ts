import DeviceBase from "./device.ts";
import WebsocketClient from "../ws_client.ts";
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database, TablesInsert, Json } from "@repo/supabase/database.types.ts";
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

      let raw_packets: IHunityPacket[] = [];

      const fetchData = async (startDate: number, endDate: number) => {
        console.log("Exp data params", startDate.toString(), endDate.toString());
        const message: string = await this.conn.execCmd("getEXPData", [
          this.exp_id,
          startDate.toString(),
          endDate.toString(),
        ]);
        console.log("sending data. Message: " + message);

        let data: IHunityPacketResponse = JSON.parse(message);
        raw_packets = raw_packets.concat(data.datas.celeritas);
      };

      let endDate = start;

      do {
        endDate += 7* 24 * 3600;
        await fetchData(start, endDate);
        start = endDate;
      } while (endDate < end);

      let parsed_packets: TablesInsert<"packets">[] = raw_packets.map(
        (packet) => {
          let details = parse_packet(packet.data);
          return {
            date: new Date(packet.unixtimestamp).toISOString(),
            packet: packet.data,
            type: details.packet_type,
            device: "ONIONSAT_TEST",
            details: details.data as Json,
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
