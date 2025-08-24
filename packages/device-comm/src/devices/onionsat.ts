import DeviceBase from "./device.ts";
import WebsocketClient from "../ws_client.ts";

export default class OnionSatDevice extends DeviceBase{
    server_link: string;
    exp_id: string;
    conn: WebsocketClient;


    constructor(){
        super();
        this.server_link = "ws://gru.onionsat.com:8080/";
        this.exp_id = "celeritas";
        this.conn = new WebsocketClient(this.server_link);

    }

    async loadData(start: number | null, end: number | null): Promise<boolean>{
        let result: boolean = false;
        console.log("loading data", this.inited);
        if(this.inited){
            if(start == null){
                start = 1;
            }
            if(end == null){
                end = Math.floor(Date.now() / 1000);
            }
            const message: string = await this.conn.execCmd("getEXPData", [start.toString(), end.toString()]);
            console.log("sending data. Message: " + message);
            result = true;
        }
        return result;

    }

    async sendCMD(cmd: string):Promise<boolean>{
        return false;
    }

}