<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <BIMDataButton
      @click="downloadSvg"
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      >{{ $t("action") }}</BIMDataButton
    >
  </div>
</template>

<script>
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";

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
      const ifc = this.$utils.getSelectedIfcs()[0];
      if (ifc.map_file) {
        window.location.href = ifc.map_file;
      } else {
        this.$hub.emit("alert", {
          type: "error",
          message: this.$t("no_svg_error"),
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "node_modules/@bimdata/design-system/dist/scss/BIMData.scss";
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
</style>
