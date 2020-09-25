import BtnPlatformDemoComponent from "./BtnPlatformDemo.vue";
import icon from "../assets/icon.svg";

export default {
  name: "btnModalKroqiComponent",
  component: BtnPlatformDemoComponent,
  display: {
    iconPosition: "right",
    content: "free",
  },
  tooltip: "modalKorqiPlugin.tooltip",
  keepActive: false,
  icon: {
    imgUri: icon,
  },
  i18n: {
    en: {
      modalKorqiPlugin: {
        tooltip: "Kroqi",
        titleBcf: "BCF manager (import / export)",
        titleEditIfc: "Edit properties and export ifc",
        titleViewer: "A 3D / 2D BIM viewer",
        btnSpace: "Access your space",
      },
    },
    fr: {
      modalKorqiPlugin: {
        tooltip: "Kroqi",
        titleBcf: "BCF manager (import / export)",
        titleEditIfc: "Editer des propriétés et exporter des ifc",
        titleViewer: "Une visionneuse BIM 3D/2D ",
        btnSpace: "Accéder à votre espace",
      },
    },
  },
};
