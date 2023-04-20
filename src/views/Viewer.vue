<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import BimObjectPlugin from "@/plugins/bimobject/dist/bimobject.plugin.esm.min.js";
import bsdd from "@/plugins/bsdd/dist/bsdd.plugin.js";
import ChristmasSleighPlugin from "@/plugins/christmasSleigh/dist/christmasSleigh.plugin.js";
import excelExportPlugin from "@/plugins/excelExport/dist/excelExport.plugin.js";
import Giro3dPlugin from "@/plugins/giro3d/dist/giro3d.plugin.js";
import GltfExtractorPlugin from "@/plugins/gltfExtractor/dist/gltfExtractor.plugin.js";
import kroqiBcfService from "@/plugins/kroqiBcfService/dist/kroqiBcfService.plugin.js";
import platformDemo from "@/plugins/platformDemo/dist/platformDemo.plugin.js";
import SnowflakesPlugin from "@/plugins/snowflakes/dist/snowflakes.plugin.js";
import SvgExtractorPlugin from "@/plugins/svgExtractor/dist/svgExtractor.plugin.js";

// import iotEquipment from "@/plugins/iotEquipment/dist/iotEquipment.plugin.js";
import iframeShare from "@/plugins/iframeShare/dist/iframeShare.plugin.js";
import bimworld from "@/plugins/bimworld/dist/bimworld.plugin.esm.min.js";
import iot from "@/plugins/iot/dist/iot.plugin.js";


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
        apiUrl: import.meta.env.VITE_APP_BIMDATA_API_URL,
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

    bimdataViewer.registerPlugin(BimObjectPlugin);
    bimdataViewer.registerPlugin(bsdd);
    bimdataViewer.registerPlugin(ChristmasSleighPlugin);
    bimdataViewer.registerPlugin(excelExportPlugin);
    bimdataViewer.registerPlugin(Giro3dPlugin);
    bimdataViewer.registerPlugin(GltfExtractorPlugin);
    bimdataViewer.registerPlugin(kroqiBcfService);
    bimdataViewer.registerPlugin(platformDemo);
    bimdataViewer.registerPlugin(SnowflakesPlugin);
    bimdataViewer.registerPlugin(SvgExtractorPlugin);
    bimdataViewer.registerPlugin(Giro3dPlugin);
    bimdataViewer.registerPlugin(IotPlugin);


    // bimdataViewer.registerPlugin(iotEquipment);
    bimdataViewer.registerPlugin(iframeShare);
    bimdataViewer.registerPlugin(bimworld);
    bimdataViewer.registerPlugin(iot);

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
