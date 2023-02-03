import { createStore } from 'vuex'
import { vuexOidcCreateStoreModule } from "vuex-oidc";
import { oidcSettings } from "@/config/oidc.js";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    oidcStore: vuexOidcCreateStoreModule(oidcSettings),
  },
});
