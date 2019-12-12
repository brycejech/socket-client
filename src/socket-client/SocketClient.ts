
import { ISocketMessage } from './interfaces';

export class SocketClient{
    private _socket: WebSocket|null = null;

    private _baseUrl:       string = '';
    private _channel:       string = '';
    private _clientId:      string = '';
    private _lastMessageId: string = '';

    // Socket connection timer fields
    private _timer:    number = 0;
    private _interval: number = 3000; // 3 seconds

    // Page suspended timer fields
    private _pageTimer:    number = 0;
    private _pageInterval: number = 1000; // 1 second
    private _lastInterval: number = Date.now();

    private _messageHandlers: Function[] = [];

    constructor(baseUrl: string, channel: string, clientId: string, lastMessageId: string){
        this._baseUrl        = baseUrl;
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

    pageHeartbeat(): void{
        const now:   number = Date.now(),
              diff:  number = now - this._lastInterval,
              offBy: number = diff - 1000;

        if(offBy > 1000){
            console.info(`[${ (new Date()).toLocaleString() }] Page timeout, re-connecting`);

            this.close();
            this.open();
        }

        this._lastInterval = now;
    }

    open(): WebSocket{
        clearInterval(this._timer);
        clearInterval(this._pageTimer)

        this._socket = new WebSocket(this.getConnectionUrl());

        this._timer     = setInterval(this.heartbeat.bind(this), this._interval);
        this._pageTimer = setInterval(this.pageHeartbeat.bind(this), this._pageInterval);

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

        this._socket.addEventListener('close', (e: CloseEvent) => {
            console.info(`[${ (new Date()).toLocaleString() }] Socket closing`);
        });

        this._socket.addEventListener('error', (e: Event) => {
            console.info(`[${ (new Date()).toLocaleString() }] Socked error: ${ e }`);
        })

        console.info(`[${ (new Date()).toLocaleString() }] Connection opened: ${ this.getConnectionUrl() }`);

        return this._socket;
    }

    close(): void{
        clearInterval(this._timer);
        clearInterval(this._pageInterval);

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
        let url = this._baseUrl;

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