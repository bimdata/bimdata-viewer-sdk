<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

// import BimObjectPlugin from "@bimdata/bimobject-viewer-plugin";
// import bimworld from "@bimdata/bimworld-viewer-plugin";
// import bsdd from "@bimdata/bsdd-viewer-plugin";
// import ChristmasSleighPlugin from "@bimdata/christmas-sleigh-viewer-plugin";
// import excelExportPlugin from "@bimdata/excel-export-plugin";
// import Giro3dPlugin from "@bimdata/giro3d-viewer-plugin";
// import GltfExtractorPlugin from "@bimdata/gltf-extractor-viewer-plugin";
// import iframeShare from "@bimdata/iframe-share-viewer-plugin";
// import iot from "@bimdata/iot-viewer-plugin";
// import iotEquipment from "@bimdata/iot-equipment-viewer-plugin";
// import kroqiBcfService from "@bimdata/bcf-kroqi-premium-service";
// import platformDemo from "@bimdata/platform-demo-viewer-plugin";
// import SnowflakesPlugin from "@bimdata/snowflakes-viewer-plugin";
// import SvgExtractorPlugin from "@bimdata/svg-extractor-viewer-plugin";
import syctom from "../plugins/syctom";

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
        },
      },
    });

    // bimdataViewer.registerPlugin(BimObjectPlugin);
    // bimdataViewer.registerPlugin(bimworld);
    // bimdataViewer.registerPlugin(bsdd);
    // bimdataViewer.registerPlugin(ChristmasSleighPlugin);
    // bimdataViewer.registerPlugin(excelExportPlugin);
    // bimdataViewer.registerPlugin(Giro3dPlugin);
    // bimdataViewer.registerPlugin(GltfExtractorPlugin);
    // bimdataViewer.registerPlugin(iframeShare);
    // bimdataViewer.registerPlugin(iot);
    // bimdataViewer.registerPlugin(iotEquipment);
    // bimdataViewer.registerPlugin(kroqiBcfService);
    // bimdataViewer.registerPlugin(platformDemo);
    // bimdataViewer.registerPlugin(SnowflakesPlugin);
    // bimdataViewer.registerPlugin(SvgExtractorPlugin);
    bimdataViewer.registerPlugin(syctom);


    bimdataViewer.mount(`#${this.viewerId}`, {
      "ratios": [50, 50],
      "children": ["3d", "syctom"]
    });

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
