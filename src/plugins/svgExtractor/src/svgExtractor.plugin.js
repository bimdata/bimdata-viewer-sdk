import SvgExtractorComponent from "./SvgExtractor.vue";
import icon from "../assets/export-svg.svg";

export default {
  name: "SvgExtractorPlugin",
  component: SvgExtractorComponent,
  addToWindows: ["2d", 'dwg'],
  button: {
    position: "right",
    content: "simple", // How the viewer show the plugin content. Value can be "panel", "simple" of "free"
    keepOpen: true,
    tooltip: "SvgExtractorPlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "Download SVG of the model",
      action: "Download SVG",
      no_svg_error: "This model has no available SVG",
    },
    fr: {
      tooltip: "Téléchargez le SVG du modèle",
      action: "Télécharger le SVG",
      no_svg_error: "Cette maquette n'a aucun SVG de disponible",
    },
  },
};
