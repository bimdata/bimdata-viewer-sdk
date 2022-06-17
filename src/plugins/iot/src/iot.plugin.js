import IotComponent from "./Iot.vue";
import icon from "../assets/icon.svg";

export default {
  name: "IotPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: IotComponent,
  addToWindows: ["3d"],
  button: {
    position: "right",
    content: "panel",
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "IotPlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "IOT plugin",
    },
    fr: {
      tooltip: "Plugin IOT",
    },
  },
};