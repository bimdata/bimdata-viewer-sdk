<template>
  <div class="viewer">
    <BimdataViewer ref="bimdataViewerInstance" :accessToken="oidcAccessToken" :cfg="viewerConfig" />
  </div>
</template>

<script>
import BimdataViewer from "@bimdata/viewer";
import SnowflakesPlugin from "@/plugins/snowflakes/snowflakes.plugin.js";
import SplitPlugin from "@/plugins/split/split.plugin.js";

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
      SplitPlugin
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