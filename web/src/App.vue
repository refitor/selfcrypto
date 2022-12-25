<template>
    <div id="app">
        <router-view v-if="isRouterAlive"></router-view>
    </div>
</template>
<script>
export default {
    name: 'App',
    provide() {
        return {
            reload: this.reload
        }
    },
    data() {
        return {
            isRouterAlive: true
        }
    },
    created() {
        const go = new Go();
	    WebAssembly.instantiateStreaming(fetch("selfcrypto.wasm"), go.importObject)
		.then((result) => go.run(result.instance));
    },
    methods: {
        reload() {
            this.isRouterAlive = false
            this.$nextTick(function() {
                this.isRouterAlive = true
            })
        }
    }
}
</script>