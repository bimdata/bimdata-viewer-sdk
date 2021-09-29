import {{UpperCaseName}}Component from './{{UpperCaseName}}.vue';
{%- if type === 'button' %}
import icon from '../assets/icon.svg';
{%- endif %}

export default {
  name: '{{UpperCaseName}}Plugin', // The name of the plugin
  component: {{UpperCaseName}}Component,
  {%- if type === 'button' %}
  addToWindows: [{% for window in windowVisibility %}'{{ window }}',{% endfor %}],
  button: {
    position: '{{buttonPosition}}', // Add an icon in the left or right panel. Value can be 'left' or 'right'
    content: '{{menuType}}',  // How the viewer show the plugin content. Value can be 'panel', 'simple' or 'free'
    keepOpen: {{keepOpen}}, // If true, the window won't be closed if user click somewhere else.
    tooltip: '{{UpperCaseName}}Plugin.tooltip', // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: '{{UpperCaseName}} is awesome!'
    },
    fr: {
      tooltip: '{{UpperCaseName}} est génial !'
    },
  },
  {%- endif %}
  {%- if type === 'window' %}
  window: {
    name: '{{UpperCaseName}}',
    label: '{{UpperCaseName}}Plugin.window_label',
    plugins: ['fullscreen'],
  },
  i18n: {
    en: {
      window_label: '{{UpperCaseName}}'
    },
    fr: {
      window_label: '{{UpperCaseName}}'
    },
  },
  {%- endif %}
};
