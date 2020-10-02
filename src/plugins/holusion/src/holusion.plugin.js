import HolusionComponent from "./Holusion.vue";

export default {
  name: "HolusionPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: HolusionComponent,
  window: {
    name: "holusion",
  },
  i18n: {
    en: {
      holusionPlugin: {
        reset: "Reset",
        togglePivot: "Toggle pivot",
        hideSpaces: "Hide spaces",
        showSpaces: "Show spaces",
        fitView: "Fit view",
        isolate: "Isolate",
        undo: "Undo",
        redo: "Redo"
      },
    },
    fr: {
      holusionPlugin: {
        reset: "Réinitialiser",
        togglePivot: "Rotation automatique",
        hideSpaces: "Espaces masqués",
        showSpaces: "Espaces affichés",
        fitView: "Ajuster la vue",
        isolate: "Isoler",
        undo: "Annuler",
        redo: "Refaire"
      },
    },
  },
};
