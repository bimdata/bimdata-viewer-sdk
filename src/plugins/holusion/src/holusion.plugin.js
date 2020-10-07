import HolusionComponent from "./Holusion.vue";

export default {
  name: "HolusionPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: HolusionComponent,
  window: {
    name: "holusion",
  },
  startupScript() {
    // TODO - may not be the best solution but... It WORKS
    const treeContentElements = Array.from(document.getElementsByClassName("tree-content"));
    treeContentElements.forEach(element => {
      element.style.fontSize = "16px";
    });

    document.styleSheets[document.styleSheets.length - 1].insertRule(".node-template { height: 36px }", 0);
  },
  i18n: {
    en: {
      reset: "Reset",
      togglePivot: "Toggle pivot",
      hideSpaces: "Hide spaces",
      showSpaces: "Show spaces",
      fitView: "Fit view",
      isolate: "Isolate",
      undo: "Undo",
      redo: "Redo"
    },
    fr: {
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
};
