import BIMDataCOBie from "./BIMDataCOBie.js";
import COBieIcon from "./COBieIcon.vue";

import de from "./lang-de.json";
import en from "./lang-en.json";
import es from "./lang-es.json";
import fr from "./lang-fr.json";
import it from "./lang-it.json";

export default {
  name: "cobie",
  i18n: { de, en, es, fr, it },
  component: BIMDataCOBie,
  addToWindows: ["3d-fragments", "3d"],
  button: {
    tooltip: "cobie.tooltip",
    position: "right",
    icon: {
      component: COBieIcon,
    },
  },
};
