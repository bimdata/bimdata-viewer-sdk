import GltfExtractorComponent from './GltfExtractor.vue';
import icon from '../assets/export-gltf.svg';

export default {
  name: 'GltfExtractorPlugin',
  ui: {
    component: GltfExtractorComponent,
    addToWindows: ["3d"],
    button: {
      position: 'right',
      content: 'simple', // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
      keepOpen: true,
      tooltip: 'tooltip', // Can be an i18n path or a string shown in all languages
      icon: {
        imgUri: icon,
      },
    },
  },
  i18n: {
    en: {
      tooltip: 'Download GLTF of the model'
    },
    fr: {
      tooltip: 'Téléchargez le GLTF du modèle'
    }
  }
};
