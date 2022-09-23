import IotEquipmentAnnotation from "./IotEquipmentAnnotation.vue";

const equipments = [
  { name: "Equipment 01", uuid: "0vNFceMkb8dezQiQhWAOcR", x: 158.3, y: 69.7 },
  { name: "Equipment 02", uuid: "1234", x: 139.5, y: 60 },
  { name: "Equipment 03", uuid: "ABCD", x: 165.5, y: 64.8 },
];

export default {
  name: "iotEquipment",
  data() {
    return {
      annotations: []
    };
  },
  onOpen() {
    this.annotations.push(
      ...equipments.map(
        ({ name, uuid, x, y }) => this.$viewer.state.addAnnotation({
          component: IotEquipmentAnnotation,
          props: { name, uuid },
          x,
          y,
          z: 0
        })
      )
    );
  },
  onClose() {
    while (this.annotations.length > 0) {
      this.$viewer.state.removeAnnotation(
        this.annotations.shift()
      );
    }
  },
  render() {
    return null;
  }
};
