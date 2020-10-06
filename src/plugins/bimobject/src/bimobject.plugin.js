import BimobjectComponent from "./Bimobject.vue";
import icon from "../assets/plugin-icon.svg";

export default {
  name: "bimObjectPlugin",
  component: BimobjectComponent,
  addToWindows: ["3d", "2d"],
  button: {
    position: "right",
    content: "panel",
    keepOpen: true,
    tooltip: "bimObjectPlugin.tooltip",
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "BIMobject",
      successMessage: "Element(s) updated",
      applySelected: "Apply to selection",
      noObject: "No object displayed.",
      noObjectResearch:
        "Please search for an object to display available items",
      search: "Search an object",
    },
    fr: {
      tooltip: "BIMobject",
      successMessage: "Élément(s) mis à jour",
      applySelected: "Appliquer à la sélection",
      noObject: "Pas d'objet à afficher",
      noObjectResearch:
        "Veuillez rechercher un objet pour afficher la liste d'objets",
      search: "Rechercher un objet",
    },
  },
};
