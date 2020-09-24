<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import makeBIMDataViewer from "@bimdata/viewer";
// import SnowflakesPlugin from "@/plugins/snowflakes/src/snowflakes.plugin.js";
// import SplitPlugin from "@/plugins/split/src/split.plugin.js";
// import BimObjectPlugin from "@/plugins/bimobject/dist/bimobject.plugin.js";
import { mapGetters } from "vuex";
import backgroundColor from "@/plugins/backgroundColor/src/backgroundColor.plugin.js";
// import SvgExtractorPlugin from "@/plugins/svgExtractor/src/svgExtractor.plugin.js";

export default {
  data() {
    return {
      viewerId: "bimdataViewerId",
    };
  },
  computed: {
    ...mapGetters(["oidcAccessToken"]),
  },
  mounted() {
    const bimdataViewer = makeBIMDataViewer({
      api: {
        cloudId: this.$route.query.cloudId,
        projectId: this.$route.query.projectId,
        ifcIds: [this.$route.query.ifcId],
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
        accessToken: this.oidcAccessToken,
      },
      plugins: {
        // Custom plugin config here
      },
    });

    // bimdataViewer.registerPlugin(SvgExtractorPlugin);
    // bimdataViewer.registerPlugin(SnowflakesPlugin);
    // bimdataViewer.registerPlugin(SplitPlugin);
    // bimdataViewer.registerPlugin(BimObjectPlugin);
    bimdataViewer.registerPlugin(backgroundColor);

    bimdataViewer.mount(`#${this.viewerId}`);
  },
};
</script>

<style scoped>
.viewer {
  height: 100vh;
  width: 100vw;
}
</style>
