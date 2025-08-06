import syctomIcon from "../assets/syctom.svg";
import SyctomComponent from "./Syctom.vue";

export default {
  name: "SyctomPlugin",
  component: SyctomComponent,
  window: {
    name: "syctom",
    label: "SyctomPlugin.window_label",
    icon: {
      imgUri: syctomIcon,
    },
  },
  i18n: {
    en: {
      window_label: "Syctom",
    },
    fr: {
      window_label: "Syctom",
    },
  },
};
