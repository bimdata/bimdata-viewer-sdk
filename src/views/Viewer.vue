<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import BimObjectPlugin from "@bimdata/bimobject-viewer-plugin/dist/bimobject.plugin.js";
import bsdd from "@bimdata/bsdd-viewer-plugin/dist/bsdd.plugin.js";
import ChristmasSleighPlugin from "@bimdata/christmas-sleigh-viewer-plugin/dist/christmasSleigh.plugin.js";
import excelExportPlugin from "@bimdata/excel-export-plugin/dist/excelExport.plugin.js";
import Giro3dPlugin from "@bimdata/giro3d-viewer-plugin/dist/giro3d.plugin.js";
import GltfExtractorPlugin from "@bimdata/gltf-extractor-viewer-plugin/dist/gltfExtractor.plugin.js";
import kroqiBcfService from "@bimdata/bcf-kroqi-premium-service/dist/kroqiBcfService.plugin.js";
import platformDemo from "@bimdata/platform-demo-viewer-plugin/dist/platformDemo.plugin.js";
import SnowflakesPlugin from "@bimdata/snowflakes-viewer-plugin/dist/snowflakes.plugin.js";
import SvgExtractorPlugin from "@bimdata/svg-extractor-viewer-plugin/dist/svgExtractor.plugin.js";

import iotEquipment from "@bimdata/iot-equipment-viewer-plugin/dist/iotEquipment.plugin.js";
import iframeShare from "@bimdata/iframe-share-viewer-plugin/dist/iframeShare.plugin.js";
import bimworld from "@bimdata/bimworld-viewer-plugin/dist/bimworld.plugin.js";
import iot from "@bimdata/iot-viewer-plugin/dist/iot.plugin.js";

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

    bimdataViewer.registerPlugin(iotEquipment);
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
