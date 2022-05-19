import ExportModal from "./ExportModal.vue";

export default {
  name: "excelExport",
  startupScript($viewer) {
    $viewer.contextMenu.registerCommand({
        get label() {
          return $viewer.vm.$t("excelExport.title");
        },
        execute: () => {
          $viewer.globalContext.modals.pushModal(ExportModal)
        },
        predicate: () => !!$viewer.state.selectedObjects.length,
      });
  },
  i18n: {
    en: {
      tooltip: "Excel Export",
      command: "Export selection",
      title: "Export selection",
      label: "File name",
      button: "Export",
      error: "A file name is mandatory",
    },
    fr: {
      tooltip: "Export Excel",
      command: "Exporter la sélection",
      title: "Exporter la sélection",
      label: "Nom du fichier",
      button: "Exporter au format Excel",
      error: "Un nom de fichier est obligatoire",
    },
  },
};
