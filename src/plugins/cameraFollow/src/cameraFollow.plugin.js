import CameraFollowComponent from "./CameraFollow.vue";
import icon from "../assets/group-icon.svg";

export default {
  name: "CameraFollowPlugin", // The name of the plugin
  component: CameraFollowComponent,
  addToWindows: ["3d"],
  button: {
    position: "right", // Add an icon in the left or right panel. Value can be 'left' or 'right'
    content: "simple", // How the viewer show the plugin content. Value can be 'panel', 'simple' or 'free'
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: "CameraFollowPlugin.tooltip", // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: "CameraFollow",
    },
    fr: {
      tooltip: "CameraFollow",
    },
  },
};
