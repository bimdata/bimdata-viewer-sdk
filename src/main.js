import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueI18n from "vue-i18n";

Vue.config.productionTip = false;
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "en", // set locale
  messages: { en: {}, fr: {} }, // set locale messages
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount("#app");
