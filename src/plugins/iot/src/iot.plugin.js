import IotComponent from "./Iot.vue";
import icon from "../assets/icon.svg";

export default {
  name: "IotPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: IotComponent,
  display: {
    iconPosition: "right", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "windowed", // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
  },
  tooltip: "tooltip", // Can be an i18n path or a string shown in all languages
  keepActive: true, // If true, the window won't be closed if user click somewhere else.
  icon: {
    imgUri: icon,
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
