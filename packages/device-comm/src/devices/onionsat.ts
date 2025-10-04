import DeviceBase from "./device.ts";
import WebsocketClient from "../ws_client.ts";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  TablesInsert,
  Json,
  Enums,
} from "@repo/supabase/database.types.ts";
import {
  IHunityPacketResponse,
  IHunityPacket,
  parse_packet,
} from "../packet_parser.ts";

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
      const { error } = await this.supabase
        .from("packets")
        .insert(parsed_packets);
      if (error) {
        console.error(error);
        throw new Error("Failed to insert packets");
      }
    }
    return true;
  }

  async sendCMD(cmd: string): Promise<boolean> {
    return false;
  }
}
