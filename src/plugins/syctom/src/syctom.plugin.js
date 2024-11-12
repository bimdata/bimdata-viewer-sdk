import SyctomComponent from './Syctom.vue';

export default {
  name: 'SyctomPlugin', // The name of the plugin
  component: SyctomComponent,
  window: {
    name: 'syctom',
    label: 'SyctomPlugin.window_label',
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
