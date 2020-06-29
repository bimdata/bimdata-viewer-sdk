import SvgExtractorComponent from "./SvgExtractor.vue";
import icon from "../assets/export-svg.svg";

export default {
  name: "SvgExtractorPlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: SvgExtractorComponent,
  display: {
    iconPosition: "right", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "simple", // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
  },
  tooltip: "tooltip", // Can be an i18n path or a string shown in all languages
  keepActive: false, // If true, the window won"t be closed if user click somewhere else.
  icon: {
    imgUri: icon,
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
