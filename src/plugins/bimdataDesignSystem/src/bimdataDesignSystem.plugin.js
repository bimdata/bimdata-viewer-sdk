import BimdataDesignSystemComponent from './BimdataDesignSystem.vue';
import icon from '../assets/icon.svg';

export default {
  name: 'BimdataDesignSystemPlugin', // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: BimdataDesignSystemComponent,
  display: {
    iconPosition: 'left', // Add an icon in the left or right panel. Value can be "left" or "right"
    content: 'windowed' // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
  },
  tooltip: 'tooltip', // Can be an i18n path or a string shown in all languages
  keepActive: false, // If true, the window won't be closed if user click somewhere else.
  icon: {
    imgUri: icon,
  },
  i18n: {
    en: {
      tooltip: 'BimdataDesignSystem is awesome!'
    },
    fr: {
      tooltip: 'BimdataDesignSystem est génial !'
    }
  }
};
