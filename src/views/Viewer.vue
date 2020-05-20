<template>
  <div class="viewer">
    <BimdataViewer ref="bimdataViewerInstance" :accessToken="oidcAccessToken" :cfg="viewerConfig" />
  </div>
</template>

<script>
import BimdataViewer from "@bimdata/viewer";
import SnowflakesPlugin from "@/plugins/snowflakes/dist/snowflakes.plugin.js";
import SplitPlugin from "@/plugins/split/src/split.plugin.js";
import BimObjectPlugin from "@/plugins/bimobject/src/bimobject.plugin.js";
import bimdataDesignSystem from "@/plugins/bimdataDesignSystem/dist/bimdataDesignSystem.plugin.js";
import { mapGetters } from "vuex";

export default {
  components: {
    BimdataViewer
  },
  data() {
    return {
      viewerConfig: {
        cloudId: this.$route.query.cloudId,
        projectId: this.$route.query.projectId,
        ifcIds: [this.$route.query.ifcId],
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL
      }
    };
  },
  computed: {
    ...mapGetters(["oidcAccessToken"])
  },
  mounted() {
    this.$refs.bimdataViewerInstance.registerPlugins([
      SnowflakesPlugin,
      SplitPlugin,
      BimObjectPlugin,
      bimdataDesignSystem
    ]);
  }
};
</script>

<style scoped>
.viewer {
  height: 100vh;
  width: 100vw;
}
</style>
