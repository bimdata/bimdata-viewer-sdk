<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="share-plugin">
    <BIMDataTabs
      :tabs="tabs"
      width="100%"
      height="40px"
      tabSize="50%"
      @tab-selected="activeTab = $event"
      selected="share"
    />
    <div class="share-plugin__share-tab" v-if="activeTab.id === 'share'">
      <div v-if="currentShare === null">
        <BIMDataCheckbox
          class="item"
          :disabled="false"
          :text="$t('IframeSharePlugin.keep_camera_setup')"
          v-model="keepCameraSetup"
        >
        </BIMDataCheckbox>

        <datepicker
          class="item"
          v-model="expirationDate"
          :clear-button="true"
          :language="fr"
          :monday-first="true"
        >
          <template #afterDateInput>
            <label style="pointer-events: none">{{
              $t("IframeSharePlugin.expiration_date")
            }}</label>
          </template>
        </datepicker>

        <BIMDataButton
          class="large-btn"
          color="primary"
          fill
          square
          icon
          @click="share"
        >
          <BIMDataIcon name="chevron" size="xxxs" />
          <span>{{ $t("IframeSharePlugin.link_creation") }}</span>
        </BIMDataButton>
      </div>

      <div v-else>
        <h4>
          <img :src="shareIcon" height="10px" />
          {{ $t("IframeSharePlugin.share") }}
        </h4>
        <div class="url">
          <p class="link">{{ currentShare }}</p>
          <BIMDataButton
            color="primary"
            fill
            square
            icon
            @click="copyUrl"
            height="10px"
          >
            <span>{{ $t("IframeSharePlugin.copy") }}</span>
          </BIMDataButton>
        </div>
        <h2>iframe</h2>
        <p>{{ iframeString }}</p>
        <BIMDataButton color="primary" fill square icon @click="copyIframe">
          <span>{{ $t("IframeSharePlugin.copy") }}</span>
        </BIMDataButton>
      </div>
    </div>

    <div v-if="activeTab.id === 'manage'">
      <BIMDataSpinner v-if="shareListLoaded === false" />
      <BIMDataTable v-else :rows="shareList" compensated="true"></BIMDataTable>
    </div>
  </div>
</template>

<script>
import {
  BIMDataIcon,
  BIMDataButton,
} from "@bimdata/design-system/components.js";
import BIMDataCheckbox from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataCheckbox.js";
import BIMDataTabs from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTabs.js";
import BIMDataSpinner from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataSpinner.js";
import BIMDataTable from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTable.js";

import Datepicker from "vuejs-datepicker";
import fr from "vuejs-datepicker/dist/locale/translations/fr";
import en from "vuejs-datepicker/dist/locale/translations/en";
import shareIcon from "../assets/share.svg";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "iframeShare",
  components: {
    BIMDataButton,
    BIMDataIcon,
    BIMDataCheckbox,
    BIMDataTabs,
    BIMDataSpinner,
    BIMDataTable,
    Datepicker,
  },
  data() {
    return {
      keepCameraSetup: false,
      shareName: "azeryl",
      expirationDate: null,
      fr: fr,
      en: en,
      currentShare: null,
      tabs: [
        { id: "share", label: this.$t("IframeSharePlugin.params") },
        { id: "manage", label: this.$t("IframeSharePlugin.manage_shares") },
      ],
      activeTab: "",
      shareListLoaded: false,
      shareList: [],
      shareIcon: shareIcon,
    };
  },
  computed: {
    shareBackendUrl() {
      return "http://localhost:8000";
      // const apiUrl = this.$viewer.api.apiUrl;
      // if (apiUrl.includes("staging")) {
      //   return "https://share-staging.bimdata.io";
      // } else if (apiUrl.includes("next")) {
      //   return "https://share-next.bimdata.io";
      // }
      // return "https://share.bimdata.io";
    },
    iframeString() {
      return `<iframe width="560" height="315" src="${this.currentShare}" frameborder="0" allowfullscreen></iframe>`;
    },
  },
  watch: {
    activeTab(newTab) {
      if (newTab.id === "manage") {
        this.loadShares();
      }
    },
  },
  onClose() {
    this.currentShare = null;
  },
  methods: {
    async share() {
      const body = {
        ifc_ids: this.$viewer.state.ifcs.map(ifc => ifc.id),
        name: this.shareName,
        locale: this.$i18n.locale,
        expires_at: "2021-04-22T06:00:00Z",
      };
      if (this.expirationDate) {
        body.expires_at = this.expirationDate.toISOString();
      } else {
        let date = new Date();
        date.setFullYear(2099);
        body.expires_at = date.toISOString();
      }

      if (this.keepCameraSetup) {
        const viewer3d = this.$viewer.localContext.getPlugin("viewer3d");
        const viewpoint = viewer3d.getViewpoint();
        delete viewpoint.snapshot;
        body.camera_settings = viewpoint;
      }
      const response = await fetch(
        `${this.shareBackendUrl}/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}/share`,
        {
          headers: {
            Authorization: `Bearer ${this.$viewer.api.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      const jsonResponse = await response.json();
      const id = jsonResponse.id;

      this.currentShare = `${this.shareBackendUrl}/${id}`;
    },
    async copy(text) {
      await navigator.clipboard.writeText(text);
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: this.$t("IframeSharePlugin.copy_success"),
      });
    },
    copyUrl() {
      this.copy(this.currentShare);
    },
    copyIframe() {
      this.copy(this.iframeString);
    },
    async loadShares() {
      this.shareListLoaded = false;
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
      this.shareList = jsonResponse.map(share => {
        delete share.camera_settings;
        delete share.cloud_id;
        delete share.project_id;
        delete share.ifc_ids;
        delete share.locale;
        share.id = this.shareBackendUrl + "/" + share.id;
        if (share.last_use) {
          share.last_use = this.$d(Date.parse(share.last_use));
        }
        share.expires_at = this.$d(Date.parse(share.expires_at));
        return share;
      });
      this.shareListLoaded = true;
    },
  },
};
</script>

<style lang="scss" scoped>
// @import "~@bimdata/design-system/dist/css/design-system.css";

.share-plugin {
  width: 800px;

  &__share-tab {
    display: flex;
    flex-direction: column;
    padding-top: 12px;

    .large-btn {
      width: 100%;
    }

    .item {
      margin: 12px 0;
    }

    .link {
      background-color: #f7f7f7;
      padding: 4px;
    }

    .url {
      display: flex;
    }
  }
}
</style>
