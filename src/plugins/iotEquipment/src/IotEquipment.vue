<template>
  <div class="iot-equipment-plugin">
    <BIMDataButton color="primary" fill radius icon @click="addIotEquipment">
      <BIMDataIcon name="plus" size="xs" />
    </BIMDataButton>
  </div>
</template>

<script>
// Components
import { BIMDataButton, BIMDataIcon } from "@bimdata/design-system/components.js";
import IotEquipmentAnnotation from "./IotEquipmentAnnotation.vue";

const equipments = [
  { name: "Tableau Electrique", uuid: "0vNFceMkb8dezQiQhWAOcR", x: 158.3, y: 69.7 },
  { name: "Tableau Electrique", uuid: "1234", x: 139.5, y: 60 },
  { name: "Tableau Electrique", uuid: "ABCD", x: 165.5, y: 64.8 },
];

export default {
  name: "IotEquipment",
  components: {
    BIMDataButton,
    BIMDataIcon
  },
  data() {
    return {
      store: equipments,
      annotations: [],
    };
  },
  mounted() {
    this.annotations.push(
      ...this.store.map(
        ({ name, uuid, x, y }) => this.$viewer.state.addAnnotation({
          component: IotEquipmentAnnotation,
          props: { name, uuid },
          x, y, z: 0
        })
      )
    );
  },
  methods: {
    addIotEquipment() {
      const viewer = this.$viewer.localContext.getPlugin("plan");
      viewer.startAnnotationMode(({ x, y }) => {
        const annotation = this.$viewer.state.addAnnotation({
          component: IotEquipmentAnnotation,
          props: { isCreation: true, x, y },
          x, y, z: 0
        });
        this.annotations.push(annotation);
        viewer.stopAnnotationMode();
      });
    },
    saveIotEquipment(equipment) {
      this.store.push(equipment);
    }
  }
};
</script>

<style>
.iot-equipment-plugin {
  position: absolute;
  z-index: 2;
  right: var(--spacing-unit);
  bottom: var(--spacing-unit);
}
</style>
