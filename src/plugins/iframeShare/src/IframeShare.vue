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
    <div class="iframe-share__body">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <ShareTab
            v-if="activeTab.id === 'share'"
            :shareBackendUrl="shareBackendUrl"
          />
          <ManageTab
            v-else-if="activeTab.id === 'manage'"
            :shareBackendUrl="shareBackendUrl"
          />
        </keep-alive>
      </transition>
    </div>
    <div class="iframe-share__footer">
      <a class="iframe-share__footer__link" href="">
        {{ $t("IframeSharePlugin.footerLinkApi") }}
      </a>
      <a class="iframe-share__footer__link right" href="">
        {{ $t("IframeSharePlugin.footerLinkExample") }}
      </a>
      <span class="iframe-share__footer__text">
        {{ $t("IframeSharePlugin.footerText") }}
      </span>
    </div>
  </div>
</template>

<script>
import BIMDataTabs from "../node_modules/@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTabs.js";

import ManageTab from "./manage-tab/ManageTab.vue";
import ShareTab from "./share-tab/ShareTab.vue";

const SHARE_BACKEND_URL_DEV = "http://localhost:8000";
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
        // return SHARE_BACKEND_URL_STAGING;
        return SHARE_BACKEND_URL_DEV;
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
@import "../node_modules/@bimdata/design-system/dist/css/design-system.css";
@import "../node_modules/@bimdata/design-system/dist/scss/_BIMDataTransitions.scss";

.iframe-share {
  display: block;
  width: 500px;
  height: 620px;
  padding: var(--spacing-unit);

  &__body {
    height: calc(100% - 140px);

    & > :first-child {
      height: 100%;
    }
  }

  &__footer {
    height: 100px;
    display: flex;
    flex-wrap: wrap;
    padding-top: calc(var(--spacing-unit) * 2);
    border-top: 1px solid var(--color-tertiary);

    &__link {
      width: 50%;
      color: var(--color-black);
      text-decoration: none;

      &.right {
        text-align: end;
      }

      &:hover {
        text-decoration: underline;
      }
    }

    &__text {
      width: 100%;
      color: var(--color-tertiary-dark);
    }
  }
}
</style>
