import Giro3dComponent from './Giro3d.vue';

export default {
  name: 'Giro3dPlugin', // The name of the plugin
  component: Giro3dComponent,
  window: {
    name: 'giro3d',
    label: 'Giro3dPlugin.window_label',
    plugins: ['fullscreen'],
  },
  i18n: {
    en: {
      window_label: 'Giro3d'
    },
    fr: {
      window_label: 'Giro3d'
    },
  },
};
