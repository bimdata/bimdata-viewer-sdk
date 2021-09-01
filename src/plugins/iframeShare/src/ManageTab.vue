<template>
  <div class="manage-tab">
    <template v-if="loading">
      <div class="manage-tab__loader">
        <BIMDataSpinner />
      </div>
    </template>
    <template v-else>
      <BIMDataTable :columns="shareColumns" :rows="shareRows" :rowHeight="40" />
    </template>
  </div>
</template>

<script>
import {
  BIMDataSpinner,
  BIMDataTable,
} from "@bimdata/design-system/components.js";

export default {
  components: {
    BIMDataSpinner,
    BIMDataTable,
  },
  props: {
    shareBackendUrl: {
      type: String,
    },
  },
  data() {
    return {
      loading: false,
      shareColumns: [
        {
          id: "id",
          label: this.$t("IframeSharePlugin.share_link"),
        },
        {
          id: "last_use",
          label: this.$t("IframeSharePlugin.last_use_date"),
          width: "120px",
          align: "center",
        },
        {
          id: "expires_at",
          label: this.$t("IframeSharePlugin.expiration_date"),
          width: "120px",
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
        delete share.camera_settings;
        delete share.cloud_id;
        delete share.project_id;
        delete share.ifc_ids;
        delete share.locale;
        share.id = this.shareBackendUrl + "/" + share.id;
        if (share.last_use) {
          share.last_use = this.$d(Date.parse(share.last_use));
        }
        if (share.expires_at) {
          share.expires_at = this.$d(Date.parse(share.expires_at));
        }
        return share;
      });
      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../node_modules/@bimdata/design-system/dist/scss/_BIMDataVariables.scss";

.manage-tab {
  padding-top: $spacing-unit;
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
