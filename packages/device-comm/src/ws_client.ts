import "./ws_patched_client";
import WSP from "wspromisify";

export default class WebsocketClient {
  conn: WSP;
  closed: boolean;

  constructor(url: string) {
    this.conn = new WSP({
      url,
      decode: (msg) => msg.toString(),
      encode: (_, msg, __) => msg.toString(),
      timeout: 2147483647, // max of 32-bit signed integer
    });
    this.closed = false;
  }

  async read(): Promise<string> {
    const response = await new Promise<string>((resolve, reject) => {
      this.conn.on("message", (event) => {
        resolve(event.data);
      });
      this.conn.on("error", (err) => {
        reject(new Error("WebSocket error: " + err));
      });
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
      await this.conn.ready();
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
    await this.conn.close();
    this.closed = true;
  }
}
