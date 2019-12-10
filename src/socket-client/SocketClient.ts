
import { ISocketMessage } from './interfaces';

export class SocketClient{
    private _socket:        WebSocket;
    private _channel:       string     = '';
    private _clientId:      string     = '';
    private _lastMessageId: string     = '';

    private _timer:    number = 0;
    private _interval: number = 3000; // 3 seconds
    

    baseUrl: string;

    constructor(baseUrl: string, channel: string, clientId: string, lastMessageId: string){
        this.baseUrl        = baseUrl;
        this._channel       = channel;
        this._clientId      = clientId;
        this._lastMessageId = lastMessageId;

        this._socket = new WebSocket(this.getConnectionUrl());

        this._socket.addEventListener('open', (e: Event) => {
            console.log('socket opened');
            console.log(e);
        });

        this._socket.addEventListener('message', (e: MessageEvent) => {
            console.log('message received');
            try{
                const message: ISocketMessage = JSON.parse(e.data);

                this._lastMessageId = message.id
                this._clientId      = message.clientId;

                console.log(message);
            }
            catch(e){
                console.error('Error de-serializing message data');
                console.error(e.message);
            }
        });
    }

    /*
        ===============
        PRIVATE METHODS
        ===============
    */
    private getConnectionUrl(): string{
        let url = this.baseUrl;

        const params: { [key: string]: any } = {
            channel:       this._channel,
            clientId:      this._clientId,
            lastMessageId: this._lastMessageId
        }

        let querystring = '';
        for(const param in params){
            const val: any = params[param];

            if(val){
                querystring += querystring.length ? '&' : '?';
                querystring += `${ param }=${ val }`;
            }
        }
        
        console.log(url + querystring)
        return querystring ? url + querystring : url;
    }
}