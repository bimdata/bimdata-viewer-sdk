<template>
  <div class="viewer">
    <BimdataViewer
      ref="bimdataViewerInstance"
      :accessToken="oidcAccessToken"
      :cfg="viewerConfig"
    />
  </div>
</template>

<script>
import BimdataViewer from '@bimdata/viewer';
import { mapGetters } from 'vuex';
import SnowflakesPlugin from '@/plugins/snowflakes/snowflakes.js'

export default {
  name: 'home',
  components: {
    BimdataViewer
  },
  data () {
    return {
      viewerConfig: {
        cloudId: process.env.VUE_APP_CLOUD_ID,
        projectId: process.env.VUE_APP_PROJECT_ID,
        ifcIds: [process.env.VUE_APP_IFC_ID],
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL
      }
    }
  },
  mounted() {
    this.$refs.bimdataViewerInstance.registerPlugins([SnowflakesPlugin])
  },
  computed: {
    ...mapGetters(['oidcAccessToken'])
  }
}
</script>
<style scoped>
.viewer {
  height: 100vh;
  width: 100vw;
}
</style>
