import BackgroundColorComponent from "./BackgroundColor.vue";

export default {
  name: "BackgroundColorPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: BackgroundColorComponent,
  keepActive: false, // If true, the window won't be closed if user click somewhere else.
  i18n: {
    en: {
      title: "Change background color",
      apply: "Apply",
      close: "Close",
    },
    fr: {
      title: "Changer la couleur de fond",
      apply: "Appliquer",
      close: "Fermer",
    },
  },
};
