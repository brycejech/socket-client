
import { ISocketMessage } from './interfaces';

export class SocketClient{
    private _socket: WebSocket|null = null;

    private _channel:       string = '';
    private _clientId:      string = '';
    private _lastMessageId: string = '';

    private _timer:    number = 0;
    private _interval: number = 3000; // 3 seconds

    private _messageHandlers: Function[] = [];

    baseUrl: string;

    constructor(baseUrl: string, channel: string, clientId: string, lastMessageId: string){
        this.baseUrl        = baseUrl;
        this._channel       = channel;
        this._clientId      = clientId;
        this._lastMessageId = lastMessageId;

        this.open();
    }

    subscribe(handler: Function): void{
        const idx = this._messageHandlers.indexOf(handler);
        if(~idx) return;

        this._messageHandlers.push(handler);
    }

    unsubscribe(handler: Function): void{
        const idx = this._messageHandlers.indexOf(handler);
        if(~idx){
            this._messageHandlers.splice(idx, 1);
        }
    }

    heartbeat(): void{
        !this.isOpen() && this.open();
    }

    open(): WebSocket{
        clearInterval(this._timer);

        this._socket = new WebSocket(this.getConnectionUrl());

        this._timer = setInterval(this.heartbeat.bind(this), this._interval);

        this._socket.addEventListener('message', (e: MessageEvent) => {
            try{
                const message: ISocketMessage = JSON.parse(e.data);

                this._lastMessageId = message.id
                this._clientId      = message.clientId;

                this._messageHandlers.forEach(cb => {
                    try{
                        cb(message);
                    }
                    catch(e){
                        console.error('Error calling socket message handler');
                        console.error(e.message);
                    }
                });
            }
            catch(e){
                console.error('Error de-serializing message data');
                console.error(e.message);
            }
        });

        return this._socket;
    }

    close(): void{
        clearInterval(this._timer);

        this._socket && this._socket.close();
        this._socket = null;
    }

    isOpen(): boolean{
        if(!this._socket) return false;
        if([WebSocket.CLOSED, WebSocket.CLOSING].includes(this._socket.readyState)) return false;

        try{
            this._socket.send('ping');
        }
        catch(e){
            return false;
        }

        return true;
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
        
        return querystring ? url + querystring : url;
    }
}