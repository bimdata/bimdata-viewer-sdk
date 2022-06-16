import BtnPlatformDemoComponent from "./BtnPlatformDemo.vue";
import icon from "../assets/icon.svg";

export default {
  name: "PlatformDemo",
  component: BtnPlatformDemoComponent,
  addToWindows: ["3d", "plan", "dwg"],
  button: {
    position: "right",
    content: "free",
    tooltip: "PlatformDemo.tooltip",
    keepOpen: false,
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "BIMData Platform",
      titleBcf: "BCF manager (import / export)",
      titleEditIfc: "Edit properties and export ifc",
      titleViewer: "A 3D / 2D BIM viewer",
      btnSpace: "Access your space",
    },
    fr: {
      tooltip: "Plateforme BIMData",
      titleBcf: "BCF manager (import / export)",
      titleEditIfc: "Editer des propriétés et exporter des ifc",
      titleViewer: "Une visionneuse BIM 3D/2D ",
      btnSpace: "Accéder à votre espace",
    },
  },
};
