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
      command: "Export quantities as Excel",
      title: "Quantities export",
      label: "File name",
      button: "Export",
      error: "A file name is mandatory",
    },
    fr: {
      tooltip: "Export Excel",
      command: "Exporter le quantitatif en Excel",
      title: "Export du quantitatif",
      label: "Nom du fichier",
      button: "Exporter au format Excel",
      error: "Un nom de fichier est obligatoire",
    },
  },
};
