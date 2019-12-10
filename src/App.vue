<template>
    <div id="app">
        <h3>WebSocket Client App</h3>
    </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: { },
})
export default class App extends Vue {
    
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
