import { BIMDataIcon } from "@bimdata/design-system";
import BIMDataPDFAnnotations from "./BIMDataPDFAnnotations.vue";

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
      component: BIMDataIcon,
      options: {
        props: {
          name: "location",
          size: "m",
        },
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
