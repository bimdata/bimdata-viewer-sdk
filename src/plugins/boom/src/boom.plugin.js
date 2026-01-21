import BoomComponent from "./Boom.vue";
import icon from "../assets/icon.svg";

export default {
  name: "BoomPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: BoomComponent,
  addToWindows: ["3d", "2d"],
  button: {
    position: "left", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "simple", // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "BoomPlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "Boom Plugin",
      verticalExplodeLabel: "Explode vertically",
      horizontalExplodeLabel: "Explode horizontally",
    },
    fr: {
      tooltip: "Boom Plugin",
      verticalExplodeLabel: "Exploser verticalement",
      horizontalExplodeLabel: "Exploser horizontalement",
    },
  },
};
