import PcNumComponent from "./PcNum.vue";
import imgUri from "../assets/windowIcon.svg";

export default {
  name: "PC-Numérique", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: PcNumComponent,
  window: {
    name: "PC-Numérique",
    label: "PC-Numérique.window_label",
    plugins: ["alerts"],
    icon: {
      imgUri,
    },
  },
  i18n: {
    en: {
      window_label: "PC-Numérique",
    },
    fr: {
      window_label: "PC-Numérique",
    },
  },
};
