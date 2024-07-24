import BulldozairBimdataPluginComponent from "./BulldozairBimdataPlugin.vue";
import icon from "../assets/icon.svg";

export default {
  name: "BulldozairBimdataPluginPlugin", // The name of the plugin
  component: BulldozairBimdataPluginComponent,
  addToWindows: ["3d", "2d"],
  button: {
    position: "right",
    keepOpen: true,
    tooltip: "ifcAnnotations.tooltip",
    icon: {
      component: "BIMDataIconLocation",
      options: { size: "m" },
    },
  },
  i18n: {
    en: {
      tooltip: "BulldozairBimdataPlugin is awesome!",
    },
    fr: {
      tooltip: "BulldozairBimdataPlugin est génial !",
    },
  },
};
