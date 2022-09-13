<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton @click="downloadSvg" color="primary" fill radius>{{
      $t("SvgExtractorPlugin.action")
    }}</BIMDataButton>
  </div>
</template>

<script>
import { BIMDataButton } from "@bimdata/design-system/components.js";

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
      const model = this.$viewer.state.models[0];
      if (model.map_file) {
        window.location.href = model.map_file;
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
