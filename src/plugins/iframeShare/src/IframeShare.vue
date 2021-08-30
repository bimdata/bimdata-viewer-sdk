<template>
  <div class="iframe-share">
    <BIMDataTabs
      :tabs="tabs"
      width="100%"
      height="40px"
      tabSize="50%"
      @tab-selected="activeTab = $event"
      selected="share"
    />
    <transition name="fade" mode="out-in">
      <ShareTab
        v-if="activeTab.id === 'share'"
        :shareBackendUrl="shareBackendUrl"
      />
      <ManageTab
        v-else-if="activeTab.id === 'manage'"
        :shareBackendUrl="shareBackendUrl"
      />
    </transition>
  </div>
</template>

<script>
import BIMDataTabs from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTabs.js";

import ManageTab from "./ManageTab.vue";
import ShareTab from "./ShareTab.vue";

const SHARE_BACKEND_URL_STAGING = "https://share-staging.bimdata.io";
const SHARE_BACKEND_URL_NEXT = "https://share-next.bimdata.io";
const SHARE_BACKEND_URL = "https://share.bimdata.io";

export default {
  name: "iframeShare",
  components: {
    BIMDataTabs,
    ManageTab,
    ShareTab,
  },
  data() {
    return {
      currentShare: null,
      tabs: [
        { id: "share", label: this.$t("IframeSharePlugin.params") },
        { id: "manage", label: this.$t("IframeSharePlugin.manage_shares") },
      ],
      activeTab: "",
    };
  },
  computed: {
    shareBackendUrl() {
      const apiUrl = this.$viewer.api.apiUrl;
      if (apiUrl.includes("staging")) {
        return SHARE_BACKEND_URL_STAGING;
      } else if (apiUrl.includes("next")) {
        return SHARE_BACKEND_URL_NEXT;
      }
      return SHARE_BACKEND_URL;
    },
  },
  onClose() {
    this.currentShare = null;
  },
};
</script>

<style scoped lang="scss">
@import "~@bimdata/design-system/dist/scss/_BIMDataVariables.scss";
@import "~@bimdata/design-system/dist/scss/_BIMDataTransitions.scss";

.iframe-share {
  display: block;
  width: 800px;
  height: 400px;
  padding: $spacing-unit;

  .share-tab,
  .manage-tab {
    height: calc(100% - 40px);
  }
}
</style>
