import Reflect from "./Reflect.vue";
import icon from "../assets/favicon-32x32.png";

export default {
  name: "ReflectPlugin", // The name of the plugin
  component: Reflect,
  window: {
    name: "REFLECT",
    label: "ReflectPlugin.window_label",
    plugins: ["alerts"],
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    fr: {
      window_label: "REFLECT by Tipee",
      search: "ex: .IfcWall ==> voir aide ?",
      ReflectTab: {
        tab1: "Projets",
        tab2: "Paramètres",
        footerLinkAPIReflect: "API REFLECT",
        footerLinkHelpReflect: "Aide",
        footerText: "",
      },
    },
  },
};
