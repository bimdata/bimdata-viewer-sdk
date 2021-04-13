<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import SnowflakesPlugin from "@/plugins/snowflakes/src/snowflakes.plugin.js";
import ChristmasSleighPlugin from "@/plugins/christmasSleigh/src/christmasSleigh.plugin.js";
import SplitPlugin from "@/plugins/split/src/split.plugin.js";
import BimObjectPlugin from "@/plugins/bimobject/src/bimobject.plugin.js";
import backgroundColor from "@/plugins/backgroundColor/src/backgroundColor.plugin.js";
import SvgExtractorPlugin from "@/plugins/svgExtractor/src/svgExtractor.plugin.js";
import GltfExtractorPlugin from "@/plugins/gltfExtractor/src/gltfExtractor.plugin.js";
import HolusionPlugin from "@/plugins/holusion/src/holusion.plugin.js";
import platformDemo from "@/plugins/platformDemo/src/platformDemo.plugin.js";
import kroqiBcfService from "@/plugins/kroqiBcfService/src/kroqiBcfService.plugin.js";

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
        bcfKroqiPremiumService: {
          kroqiDomain: "pfptnbdev.io",
          organization: "cstb",
          userIsAdmin: true,
          kroqiProjectId: "123456789",
          service: "BIMDATA",
        },
      },
    });

    bimdataViewer.registerPlugin(platformDemo);
    bimdataViewer.registerPlugin(SvgExtractorPlugin);
    bimdataViewer.registerPlugin(GltfExtractorPlugin);
    bimdataViewer.registerPlugin(SnowflakesPlugin);
    bimdataViewer.registerPlugin(ChristmasSleighPlugin);
    bimdataViewer.registerPlugin(SplitPlugin);
    bimdataViewer.registerPlugin(BimObjectPlugin);
    bimdataViewer.registerPlugin(backgroundColor);
    bimdataViewer.registerPlugin(HolusionPlugin);
    bimdataViewer.registerPlugin(kroqiBcfService);

    bimdataViewer.registerWindow({ name: "structure", plugins: ["structure"] });

    bimdataViewer.mount(`#${this.viewerId}`);

    this.$watch(
      () => this.oidcAccessToken,
      token => {
        bimdataViewer.setAccessToken(token);
      }
    );
  },
};
</script>

<style scoped>
.viewer {
  height: 100vh;
  width: 100vw;
}
</style>
