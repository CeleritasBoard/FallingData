import WebsocketClient from "../ws_client.ts";


export default abstract class DeviceBase{
    protected abstract conn: WebsocketClient;
    protected readonly abstract server_link: string;
    protected readonly abstract exp_id: string;
    protected inited: boolean = false;
    abstract sendCMD(cmd: string): Promise<boolean>;
    abstract loadData(start: number | null, end: number | null): Promise<boolean>;
    async init(): Promise<boolean>{
        const result: boolean = await this.conn.login(this.exp_id, Deno.env.get(this.exp_id)!);
        console.log("login result: " + Deno.env.get(this.exp_id)!);
        if(result){
            this.inited = true;
            return result
        }
        else{
            this.inited = false;
            return result;
        }

    }
    close(){
        this.conn.close();
        this.inited = false;
    }

}