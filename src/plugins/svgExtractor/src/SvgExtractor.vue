<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton @click="downloadSvg" color="primary" fill radius>{{
      $t("SvgExtractorPlugin.action")
    }}</BIMDataButton>
  </div>
</template>

<script>
import { BIMDataButton } from "../node_modules/@bimdata/design-system/components.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "svgExtractor",
  components: {
    BIMDataButton,
  },
  data() {
    return {};
  },
  methods: {
    downloadSvg() {
      const ifc = this.$viewer.state.ifcs[0];
      if (ifc.map_file) {
        window.location.href = ifc.map_file;
      } else {
        this.$viewer.localContext.hub.emit("alert", {
          type: "error",
          message: this.$t("SvgExtractorPlugin.no_svg_error"),
        });
      }
    },
  },
};
</script>
