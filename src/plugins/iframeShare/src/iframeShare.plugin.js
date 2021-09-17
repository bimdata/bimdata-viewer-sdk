import IframeShareComponent from "./IframeShare.vue";
import icon from "../assets/share.svg";

export default {
  name: "IframeSharePlugin", // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: IframeShareComponent,
  addToWindows: ["3d", "2d"],
  button: {
    position: "right", // Add an icon in the left or right panel. Value can be "left" or "right"
    content: "free", // How the viewer show the plugin content. Value can be "panel", "simple" of "free"
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "IframeSharePlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      footerLinkApi: "API Reference",
      footerLinkExample: "Code examples",
      footerText:
        "By using BIMData viewer on your website, you agree to BIMData API terms of service.",
      ManageTab: {
        title: "Manage Shares",
        columns: {
          link: "Share link",
          last_use: "Last use date",
          expires_at: "Expiration date",
        },
      },
      ShareTab: {
        title: "Share params",
      },
      ShareCreationForm: {
        nameInputLabel: "Share name",
        nameInputError: "Please, enter a valid share name !",
        keepCameraSetup: "Keep camera position",
        createLinkButtonText: "Generate a link",
        createSuccessMessage: "Link successfully created.",
      },
      ShareInfo: {
        backButtonText: "Back",
        shareIframeTitle: "Embed viewer",
        shareButtonText: "Share",
        copyButtonText: "Copy",
        copySuccessMessage: "Copied !",
      },
      TokenDurationInput: {
        label: "Token duration (in days)",
        info: "(unlimited)",
      },
    },
    fr: {
      footerLinkApi: "Référence de l'API",
      footerLinkExample: "Exemples de code de développeur",
      footerText:
        "En intégrant la visionneuse BIMData sur votre site, vous acceptez les conditions d'utilisation de l'API BIMData.",
      ManageTab: {
        title: "Gérer",
        columns: {
          link: "Lien de partage",
          last_use: "Dernière utilisation",
          expires_at: "Date d'expiration",
        },
      },
      ShareTab: {
        title: "Paramètres de partage",
      },
      ShareCreationForm: {
        nameInputLabel: "Nom du lien",
        nameInputError: "Nom de lien invalide !",
        keepCameraSetup: "Conserver la position de la caméra",
        createLinkButtonText: "Générer un lien",
        createSuccessMessage: "Lien créé avec succès.",
      },
      ShareInfo: {
        backButtonText: "Retour",
        shareIframeTitle: "Intégrer la visionneuse",
        shareButtonText: "Partager",
        copyButtonText: "Copier",
        copySuccessMessage: "Copié !",
      },
      TokenDurationInput: {
        label: "Durée de validité du token (en jours)",
        info: "(illimitée)",
      },
    },
  },
};
