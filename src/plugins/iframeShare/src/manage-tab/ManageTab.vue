<template>
  <div class="manage-tab">
    <transition name="fade" mode="out-in">
      <template v-if="loading">
        <div class="manage-tab__loader">
          <BIMDataSpinner />
        </div>
      </template>
      <template v-else>
        <BIMDataTable :columns="shareColumns" :rows="shareRows" :rowHeight="40">
          <template #cell-link="{ row: share }">
            <ShareLinkCell :shareBackendUrl="shareBackendUrl" :share="share" />
          </template>
        </BIMDataTable>
      </template>
    </transition>
  </div>
</template>

<script>
import {
  BIMDataSpinner,
  BIMDataTable,
} from "@bimdata/design-system/components.js";
import ShareLinkCell from "./ShareLinkCell.vue";

export default {
  components: {
    BIMDataSpinner,
    BIMDataTable,
    ShareLinkCell,
  },
  props: {
    shareBackendUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      shareColumns: [
        {
          id: "link",
          label: this.$t("IframeSharePlugin.ManageTab.columns.link"),
        },
        {
          id: "last_use",
          label: this.$t("IframeSharePlugin.ManageTab.columns.last_use"),
          width: "110px",
          align: "center",
        },
        {
          id: "expires_at",
          label: this.$t("IframeSharePlugin.ManageTab.columns.expires_at"),
          width: "110px",
          align: "center",
        },
      ],
      shareRows: [],
    };
  },
  mounted() {
    this.loadShares();
  },
  methods: {
    async loadShares() {
      this.loading = true;
      const response = await fetch(
        `${this.shareBackendUrl}/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}/share`,
        {
          headers: {
            Authorization: `Bearer ${this.$viewer.api.accessToken}`,
            Accept: "application/json",
          },
        }
      );
      const jsonResponse = await response.json();
      this.shareRows = jsonResponse.map(share => {
        return {
          id: share.id,
          name: share.name,
          open_count: share.open_count,
          last_use: share.last_use ? this.$d(Date.parse(share.last_use)) : "",
          expires_at: share.expires_at
            ? this.$d(Date.parse(share.expires_at))
            : "",
          camera_settings: share.camera_settings,
        };
      });
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
.manage-tab {
  padding-top: var(--spacing-unit);
  overflow: auto;

  &__loader {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .bimdata-spinner {
      transform: scale(2);
    }
  }
}
</style>
