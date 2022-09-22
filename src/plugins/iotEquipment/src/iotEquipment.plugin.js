import IotEquipmentComponent from './IotEquipment.js';
import icon from '../assets/icon.svg';

export default {
  name: 'IotEquipmentPlugin',
  component: IotEquipmentComponent,
  addToWindows: ['plan'],
  button: {
    position: 'right',
    content: 'simple',
    keepOpen: true,
    tooltip: 'IotEquipmentPlugin.tooltip',
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      tooltip: 'IoT Equipment'
    },
    fr: {
      tooltip: 'IoT Equipment'
    },
  },
};
