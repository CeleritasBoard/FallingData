import { WebSocket } from "ws";
import { SugarWs } from "sugar_ws";

export default class WebsocketClient {
  conn: SugarWs;
  closed: boolean;

  constructor(url: string) {
    this.conn = new SugarWs(url);
    this.closed = false;
  }

  async read(): Promise<string> {
    const response = await new Promise<string>((resolve, reject) => {
      this.conn.onmessage = (event) => {
        resolve(event.data);
      };
      this.conn.onerror = (err) => {
        reject(new Error("WebSocket error: " + err));
      };
    });
    return response;
  }

  async execCmd(cmd: string, params: string[]): Promise<string> {
    if (this.closed) {
      throw new Error("Connection closed");
    } else {
      let dataToSend: string = cmd + "(";
      for (let i = 0; i < params.length; i++) {
        dataToSend += params[i];
        if (i < params.length - 1) {
          dataToSend += ", ";
        }
      }
      dataToSend += ")";
      await this.conn.wait_for("open");
      this.conn.send(dataToSend);
      return await this.read();
    }
  }
  async login(exp_id: string, api_key: string): Promise<boolean> {
    try {
      const responseText = await this.execCmd("login", [exp_id, api_key]);
      return responseText.toLowerCase() === `${exp_id.toLowerCase()} logged in`;
    } catch (err) {
      throw err;
    }
  }

  async close() {
    await this.conn.wait_for("close").and_close();
    this.closed = true;
  }
}
