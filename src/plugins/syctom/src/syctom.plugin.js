import SyctomComponent from './Syctom.vue';
import syctomIcon from "../assets/syctom.svg";

export default {
  name: 'SyctomPlugin', // The name of the plugin
  component: SyctomComponent,
  window: {
    name: 'syctom',
    label: 'SyctomPlugin.window_label',
    icon: {
      imgUri: syctomIcon,
    },
  },
  i18n: {
    en: {
      window_label: 'Syctom',
    },
    fr: {
      window_label: 'Syctom',
    },
  },
};
