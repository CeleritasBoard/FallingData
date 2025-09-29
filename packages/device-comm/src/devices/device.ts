import WebsocketClient from "../ws_client.ts";
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database } from "@repo/supabase/database.types.ts";

export default abstract class DeviceBase {
  protected abstract conn: WebsocketClient;
  protected abstract supabase: SupabaseClient<Database>;
  protected abstract readonly server_link: string;
  protected abstract readonly exp_id: string;
  protected abstract readonly device_name: string;
  protected inited: boolean = false;
  abstract sendCMD(cmd: string): Promise<boolean>;
  abstract loadData(start: number | null, end: number | null): Promise<boolean>;

  async init(): Promise<boolean> {
    const result: boolean = await this.conn.login(
      this.exp_id,
      Deno.env.get(`${this.device_name.toUpperCase()}_API_KEY`)!,
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
