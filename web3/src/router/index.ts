// import Vue from "vue";
// import VueRouter, { RouteConfig } from "vue-router";

// Vue.use(VueRouter);
// const routes: RouteConfig[] = [
//   {
//     name: "index",
//     path: "/",
//     component: () => import("@/views/home/index.vue"),
//   },
//   {
//     name: "go",
//     path: "/go",
//     component: () => import("@/views/go/index.vue"),
//   },
// ];
// const router = new VueRouter({
//   mode: "history",
//   base: "/",
//   routes,
// });
// export default router;

import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../pages/index.vue'

Vue.use(VueRouter)
  const routes = [
  {
      path: '/',
      name: 'Index',
      component: Index
  }
]

const router = new VueRouter({
  routes
})

export default router

