import {{UpperCaseName}}Component from './{{UpperCaseName}}.vue';
import icon from '../assets/icon.svg';

export default {
  name: '{{UpperCaseName}}Plugin', // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: {{UpperCaseName}}Component,
  display: {
    {% if iconPosition -%}
    iconPosition: '{{iconPosition}}', // Add an icon in the left or right panel. Value can be "left" or "right"
    {% endif -%}
    content: '{{content}}' // How the viewer show the plugin content. Value can be "windowed", "simple" of "free"
  },
  tooltip: 'tooltip', // Can be an i18n path or a string shown in all languages
  keepActive: {{keepActive}}, // If true, the window won't be closed if user click somewhere else.
  icon: {
    imgUri: icon,
  },
  i18n: {
    en: {
      tooltip: '{{UpperCaseName}} is awesome!'
    },
    fr: {
      tooltip: '{{UpperCaseName}} est génial !'
    }
  }
};
