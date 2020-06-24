import Vue from "vue";
import Vuex from "vuex";
import { vuexOidcCreateStoreModule } from "vuex-oidc";
import { oidcSettings } from "@/config/oidc.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    oidcStore: vuexOidcCreateStoreModule(oidcSettings),
  },
});
