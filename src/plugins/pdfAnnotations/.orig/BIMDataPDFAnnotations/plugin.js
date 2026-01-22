import BIMDataPDFAnnotations from "./BIMDataPDFAnnotations.vue";

// TODO: this plugin should be moved to the SDK

export default {
  name: "pdfAnnotations",
  component: BIMDataPDFAnnotations,
  addToWindows: ["plan"],
  button: {
    position: "right",
    content: "simple",
    keepOpen: true,
    tooltip: "pdfAnnotations.tooltip",
    icon: {
      component: "BIMDataIconLocation",
      options: {
        size: "m",
      },
    },
  },
  i18n: {
    en: {
      tooltip: "PDF Annotations",
      delete: "Delete",
    },
    fr: {
      tooltip: "Annotations PDF",
      delete: "Supprimer",
    },
  },
};
