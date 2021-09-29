import BsddComponent from "./Bsdd.vue";
import imgUri from "../assets/windowIcon.svg";

export default {
  name: "BsddPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: BsddComponent,
  window: {
    name: "bSDD",
    label: "BsddPlugin.window_label",
    plugins: ["alerts"],
    icon: {
      imgUri,
    },
  },
  i18n: {
    en: {
      window_label: "bSDD",
    },
    fr: {
      window_label: "bSDD",
    },
  },
};
