import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Viewer from "../views/Viewer.vue";
import OidcCallback from "@/views/OidcCallback.vue";
import { vuexOidcCreateRouterMiddleware } from "vuex-oidc";
import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/viewer",
    name: "viewer",
    component: Viewer,
    beforeEnter(to, from, next) {
      if (to.query.cloudId && to.query.projectId && to.query.modelId) {
        next();
      } else {
        next("/");
      }
    },
  },
  {
    path: "/oidc-callback", // Needs to match redirectUri (redirect_uri if you use snake case) in you oidcSettings
    name: "oidcCallback",
    component: OidcCallback,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach(vuexOidcCreateRouterMiddleware(store));

export default router;
