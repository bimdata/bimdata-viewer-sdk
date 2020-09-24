import BimobjectComponent from "./Bimobject.vue";
import icon from "../assets/plugin-icon.svg";

export default {
  name: "bimObjectPlugin",
  ui: {
    component: BimobjectComponent,
    addToWindows: ["__all__"],
    button: {
      position: "right",
      content: "panel",
      keepOpen: true,
      tooltip: "bimObjectPlugin.tooltip",
      icon: {
        imgUri: icon,
      },
    }
  },
  i18n: {
    en: {
      bimObjectPlugin: {
        tooltip: "BIMobject",
        successMessage: "Objects updated",
        applySelected: "Apply to selection",
        noObject: "No object displayed.",
        noObjectResearch:
          "Please search for an object to display available items",
        search: "Search an object",
      },
    },
    fr: {
      bimObjectPlugin: {
        tooltip: "BIMobject",
        successMessage: "Objects mis à jour",
        applySelected: "Appliquer à la sélection",
        noObject: "Pas d'objet à afficher",
        noObjectResearch:
          "Veuillez rechercher un objet pour afficher la liste d'objets",
        search: "Rechercher un objet",
      },
    },
  },
};
