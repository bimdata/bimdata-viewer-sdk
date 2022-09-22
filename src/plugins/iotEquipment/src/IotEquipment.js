import IotEquipmentAnnotation from "./IotEquipmentAnnotation.vue";

const equipments = [
  { name: "Equipment 01", uuid: "0vNFceMkb8dezQiQhWAOcR", x: 150, y: 75 },
  { name: "Equipment 02", uuid: "1234", x: 106, y: 52 },
  { name: "Equipment 03", uuid: "ABCD", x: 175, y: 61 },
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
