import BimworldComponent from './Bimworld.js';

export default {
  name: 'BimworldPlugin', // The name of the plugin
  component: BimworldComponent,
  addToWindows: ['3d',],
  i18n: {
    en: {
      tooltip: 'Bimworld is awesome!'
    },
    fr: {
      tooltip: 'Bimworld est génial !'
    },
  },
};
