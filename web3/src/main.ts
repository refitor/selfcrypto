// // import { createApp } from 'vue'
// // TypeScript error? Run VSCode command
// // TypeScript: Select TypeScript version - > Use Workspace Version
// import App from "./App.vue";
// import Vue from "vue";
// import router from "./router";
// import "@/plugins/element";
// import store from "@/store";
// // createApp(App).mount('#app')
// new Vue({
//   router,
//   store,
//   render: (h) => h(App),
// }).$mount("#app");

// main.js
import Vue from 'vue'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import App from './App.vue';
import router from './router';
// import VueI18n from 'vue-i18n';
import cookie from 'vue-cookie';
import axios from 'axios';
import Vue2Editor from "vue2-editor";

Vue.use(ViewUI);
Vue.use(Vue2Editor);
// Vue.use(VueI18n);
// Vue.locale = () => {};
Vue.config.productionTip = false
Vue.prototype.$cookie = cookie;

// axios with cookie
axios.defaults.withCredentials = false;
Vue.prototype.$axios = axios;

// ignore console.log
console.log = ()=>{}

// const i18n = new VueI18n({
//     locale: 'en-US',    // 语言标识, 通过切换locale的值来实现语言切换,this.$i18n.locale 
//     messages: {
//       'zh-CN': require('./lang/zh'),   // 中文语言包
//       'en-US': require('./lang/en')    // 英文语言包
//     }
// })

new Vue({
    // i18n,
    router,
    render: h => h(App)
}).$mount('#app')
