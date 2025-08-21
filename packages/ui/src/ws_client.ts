class WebsocketClient {
    conn: WebSocket;
    closed : boolean;
    constructor(url: string) {
        this.conn = new WebSocket(url);
        this.closed = false;
    }

    async execCmd(cmd: string, params: string[]): Promise<string>{

        if(this.closed){
            const response =  new Error("Connection closed");
            return response.message;
        }
        else{
            let dataToSend:string = cmd+"(";
            for(let i = 0; i < params.length; i++){
                dataToSend += params[i];
                if(i < params.length - 1){
                    dataToSend += ", ";
                }
            }
            dataToSend += ")";
            this.conn.send(dataToSend);
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
    }
    async login(exp_id: string, api_key: string): Promise<boolean>{
        try{
            const responseText = await this.execCmd("login", [exp_id, api_key]);
            return responseText === "true";
        }
        catch(err){
            return false;
        }

    }

    close(){
        this.conn.close();
        this.closed = true;
    }
}

