import SnowflakesComponent from "./Snowflakes.vue";
import icon from "../assets/icon.svg";

export default {
  name: "SnowflakesPlugin",
  addToWindows: ["3d"],
  component: SnowflakesComponent,
  button: {
    position: "left",
    content: "free",
    tooltip: "Let It Snow!",
    keepOpen: true,
    icon: {
      imgUri: icon,
    },
  }
};
