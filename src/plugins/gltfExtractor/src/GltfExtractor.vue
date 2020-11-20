<template>
  <div>
    <BIMDataButton color="primary" fill radius @click="downloadGltf"
      >Download GLTF</BIMDataButton
    >
  </div>
</template>

<script>
import { BIMDataButton } from "../node_modules/@bimdata/design-system/components.js";
export default {
  name: "gltfExtractor",
  components: {
    BIMDataButton,
  },
  data() {
    return {};
  },
  methods: {
    downloadGltf() {
      const ifc = this.$viewer.state.ifcs[0];
      window.location.href = ifc.gltf_file;
    },
  },
};
</script>
