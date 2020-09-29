import HolusionComponent from './Holusion.vue';

export default {
  name: 'HolusionPlugin', // The name of the plugin. this.$plugins.MyPluginName to access it from other plugins
  component: HolusionComponent,
  window: {
    name: "holusion"
  },
};
