import icon from "../assets/icon.svg";

import ColorizerComponent from "./Colorizer.vue";

export default {
  name: "ColorizerPlugin", // The name of the plugin. this.$plugins.MyPluginName
  // to access it from other plugins
  component: ColorizerComponent,
  addToWindows: ["3d"],
  button: {
    position: "right", // Add an icon in the left or right panel. Value can be
    // "left" or "right"
    content: "panel", // How the viewer show the plugin content. Value can be
    // "windowed", "simple" of "free"
    keepOpen: true, // If true, the window won't be closed if user click
    // somewhere else.
    tooltip: "ColorizerPlugin.tooltip", // Can be an i18n path or a string
    // shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: { tooltip: "Colorizer is awesome!" },
    fr: { tooltip: "Colorizer est génial !" },
  },
};
