import ChristmasSleighComponent from "./christmasSleigh.vue";
import icon from "../assets/icon.svg";

export default {
  name: "christmasSleighPlugin",
  addToWindows: ["3d"],
  component: ChristmasSleighComponent,
  button: {
    position: "left",
    content: "free",
    tooltip: "Christmas sleigh",
    keepOpen: true,
    icon: {
      imgUri: icon,
    },
  }
};
