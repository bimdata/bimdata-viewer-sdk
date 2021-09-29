import KroqiBcfServiceComponent from "./KroqiBcfService.vue";
import { BIMDataIcon } from "@bimdata/design-system/components.js";

export default {
  name: "bcfKroqiPremiumService", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: KroqiBcfServiceComponent,
  addToWindows: ["3d"],
  button: {
    position: "left", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "panel", // How the viewer show the plugin content. Value can be "panel", "simple" of "free"
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "bcfKroqiPremiumService.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      component: BIMDataIcon,
      options: {
        props: {
          name: "bcf",
          size: "m",
        },
      },
    },
  },
  i18n: {
    en: {
      tooltip: "BCF Manager",
      activate: "Activate the service",
    },
    fr: {
      tooltip: "BCF Manager",
      activate: "Activer le service",
    },
  },
};
