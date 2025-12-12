import WebsocketClient from "../ws_client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase/database.types";

export default abstract class DeviceBase {
  protected abstract conn: WebsocketClient;
  protected abstract supabase: any;
  protected abstract readonly server_link: string;
  protected abstract readonly exp_id: string;
  protected abstract readonly device_name: string;
  protected inited: boolean = false;
  abstract sendCMD(cmd: string, execTime: number): Promise<boolean>;
  abstract loadData(start: number | null, end: number | null): Promise<boolean>;

  async init(): Promise<boolean> {
    const result: boolean = await this.conn.login(
      this.exp_id,
      process.env[`${this.device_name.toUpperCase()}_API_KEY`]!,
    );
    if (result) {
      this.inited = true;
      return result;
    } else {
      this.inited = false;
      throw new Error("Failed to log in!");
    }
  }

  async close() {
    await this.conn.close();
    this.inited = false;
  }
}
