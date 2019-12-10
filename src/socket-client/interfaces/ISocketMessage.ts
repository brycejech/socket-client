
export interface ISocketMessage{
    id:       string;
    clientId: string;
    channel:  string;
    type:     string;
    data:     any;
}