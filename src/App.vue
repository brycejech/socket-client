<template>
    <div id="app">
        <h3>WebSocket Client App</h3>
    </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

import { SocketClient } from './socket-client';
import { ISocketMessage } from './socket-client/interfaces';

@Component({
    components: { },
})
export default class App extends Vue {

    url:           string = 'ws://localhost:9999/websocket';
    channel:       string = 'foo';
    clientId:      string = '';
    lastMessageId: string = '';

    client: SocketClient = new SocketClient(this.url, this.channel, this.clientId, this.lastMessageId);

    created(): void{
        this.client.subscribe((message: ISocketMessage) => {
            console.log(message);
        });

        (<any>window).client = this.client;
    }

}
</script>

<style lang="sass">
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin-top: 60px
</style>
