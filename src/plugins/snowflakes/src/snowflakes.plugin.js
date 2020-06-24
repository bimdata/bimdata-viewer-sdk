import SnowflakesComponent from "./Snowflakes.vue";
import icon from "../assets/icon.svg";

export default {
  name: "SnowflakesPlugin",
  component: SnowflakesComponent,
  display: {
    iconPosition: "left",
    content: "free",
  },
  tooltip: "Let It Snow!",
  keepActive: true,
  asyncLoading: true,
  icon: {
    imgUri: icon,
  },
};
