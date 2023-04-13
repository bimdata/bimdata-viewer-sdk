<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import backgroundColor from "@/plugins/backgroundColor/src/backgroundColor.plugin.js";
import BimObjectPlugin from "@/plugins/bimobject/src/bimobject.plugin.js";
import bsdd from "@/plugins/bsdd/src/bsdd.plugin.js";
import ChristmasSleighPlugin from "@/plugins/christmasSleigh/src/christmasSleigh.plugin.js";
import excelExportPlugin from "@/plugins/excelExport/src/excelExport.plugin.js";
import GltfExtractorPlugin from "@/plugins/gltfExtractor/src/gltfExtractor.plugin.js";
import HolusionPlugin from "@/plugins/holusion/src/holusion.plugin.js";
import kroqiBcfService from "@/plugins/kroqiBcfService/src/kroqiBcfService.plugin.js";
import platformDemo from "@/plugins/platformDemo/src/platformDemo.plugin.js";
import SnowflakesPlugin from "@/plugins/snowflakes/src/snowflakes.plugin.js";
import SplitPlugin from "@/plugins/split/src/split.plugin.js";
import SvgExtractorPlugin from "@/plugins/svgExtractor/src/svgExtractor.plugin.js";
import Giro3dPlugin from "@/plugins/giro3d/src/giro3d.plugin.js";
import IotPlugin from "@/plugins/iot/src/iot.plugin.js";

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
      locale: "fr",
      api: {
        cloudId: this.$route.query.cloudId,
        projectId: this.$route.query.projectId,
        modelIds: [this.$route.query.modelId],
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

    // bimdataViewer.registerPlugin(backgroundColor);
    bimdataViewer.registerPlugin(BimObjectPlugin);
    bimdataViewer.registerPlugin(bsdd);
    bimdataViewer.registerPlugin(ChristmasSleighPlugin);
    bimdataViewer.registerPlugin(excelExportPlugin);
    bimdataViewer.registerPlugin(GltfExtractorPlugin);
    bimdataViewer.registerPlugin(HolusionPlugin);
    bimdataViewer.registerPlugin(kroqiBcfService);
    bimdataViewer.registerPlugin(platformDemo);
    bimdataViewer.registerPlugin(SnowflakesPlugin);
    bimdataViewer.registerPlugin(SplitPlugin);
    bimdataViewer.registerPlugin(SvgExtractorPlugin);
    bimdataViewer.registerPlugin(Giro3dPlugin);
    bimdataViewer.registerPlugin(IotPlugin);


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
