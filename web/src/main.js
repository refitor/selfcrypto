// main.js
import Vue from 'vue'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import App from './App.vue';
import router from './router';
// import VueI18n from 'vue-i18n';
import cookie from 'vue-cookie';
import axios from 'axios';

Vue.use(ViewUI);
// Vue.use(VueI18n);
// Vue.locale = () => {};
Vue.config.productionTip = false
Vue.prototype.$cookie = cookie;

// axios with cookie
axios.defaults.withCredentials = false;
Vue.prototype.$axios = axios;

// ignore console.log
// console.log = ()=>{}

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