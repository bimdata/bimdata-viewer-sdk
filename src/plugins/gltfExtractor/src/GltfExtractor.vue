<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton @click="downloadGltf" color="primary" fill radius>
      {{ $t("GltfExtractorPlugin.action") }}
    </BIMDataButton>
  </div>
</template>

<script>
import { BIMDataButton } from "@bimdata/design-system/components.js";

export default {
  // https://vuejs.org/v2/guide/components.html
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
