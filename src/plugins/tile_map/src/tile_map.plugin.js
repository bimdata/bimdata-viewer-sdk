import Tile_mapComponent from "./Tile_map.vue";
import icon from "../assets/icon.svg";

export default {
  name: "Tile_mapPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: Tile_mapComponent,
  addToWindows: ["3d"],
  button: {
    position: "left", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "simple", // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "Tile_mapPlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "Tile_map is awesome!",
    },
    fr: {
      tooltip: "Tile_map est génial !",
    },
  },
};
