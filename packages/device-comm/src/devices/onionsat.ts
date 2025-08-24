import DeviceBase from "./device.ts";
import WebsocketClient from "../ws_client.ts";

export default class OnionSatDevice extends DeviceBase {
  protected server_link: string;
  protected exp_id: string;
  protected device_name: string;
  protected conn: WebsocketClient;

  constructor() {
    super();
    this.server_link = "ws://gru.onionsat.com:8080/";
    this.exp_id = "celeritas";
    this.device_name = "ONIONSAT";
    this.conn = new WebsocketClient(this.server_link);
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
      result = true;
    }
    return result;
  }

  async sendCMD(cmd: string): Promise<boolean> {
    return false;
  }
}
