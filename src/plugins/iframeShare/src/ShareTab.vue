<template>
  <div class="share-tab">
    <template v-if="currentShare === null">
      <div class="share-tab__body">
        <Datepicker
          v-model="expirationDate"
          :clear-button="true"
          :language="fr"
          :monday-first="true"
        >
          <template #afterDateInput>
            <label style="pointer-events: none">
              {{ $t("IframeSharePlugin.expiration_date") }}
            </label>
          </template>
        </Datepicker>

        <BIMDataCheckbox
          :disabled="false"
          :text="$t('IframeSharePlugin.keep_camera_setup')"
          v-model="keepCameraSetup"
        />
      </div>

      <BIMDataButton color="primary" fill radius @click="share">
        <BIMDataIcon name="chevron" size="xxxs" margin="0 6px 0 0" />
        <span>{{ $t("IframeSharePlugin.link_creation") }}</span>
      </BIMDataButton>
    </template>

    <template v-else>
      <div class="share-tab__body">
        <h2>
          <BIMDataIcon name="share" size="s" margin="0 6px 0 0" />
          <span>{{ $t("IframeSharePlugin.share") }}</span>
        </h2>
        <div class="share-tab__link">
          <span class="share-tab__link__url">
            {{ currentShare }}
          </span>
          <BIMDataButton
            class="share-tab__link__btn"
            height="10px"
            color="primary"
            fill
            square
            @click="copyUrl"
          >
            <span>{{ $t("IframeSharePlugin.copy") }}</span>
          </BIMDataButton>
        </div>

        <h2>&lt;&sol;&gt; iframe</h2>
        <div class="share-tab__iframe">
          <pre>{{ iframeString }}</pre>
        </div>
      </div>

      <BIMDataButton color="primary" fill radius @click="copyIframe">
        {{ $t("IframeSharePlugin.copy") }}
      </BIMDataButton>
    </template>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import fr from "vuejs-datepicker/dist/locale/translations/fr";
import en from "vuejs-datepicker/dist/locale/translations/en";
import {
  BIMDataButton,
  BIMDataCheckbox,
  BIMDataIcon,
} from "@bimdata/design-system/components.js";
import shareIcon from "../assets/share.svg";

export default {
  components: {
    BIMDataButton,
    BIMDataCheckbox,
    BIMDataIcon,
    Datepicker,
  },
  props: {
    shareBackendUrl: {
      type: String,
    },
  },
  data() {
    return {
      fr,
      en,
      shareIcon,
      keepCameraSetup: false,
      expirationDate: null,
      currentShare: null,
    };
  },
  computed: {
    iframeString() {
      return (
        `<iframe\n` +
        `  width="560" height="315"\n` +
        `  src="${this.currentShare}"\n` +
        `  frameborder="0"\n` +
        `  allowfullscreen>\n` +
        `</iframe>`
      );
    },
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
  },
};
</script>

<style scoped lang="scss">
@import "~@bimdata/design-system/dist/scss/_BIMDataVariables.scss";

.share-tab {
  display: flex;
  flex-direction: column;
  padding-top: $spacing-unit;

  &__body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    h2 {
      margin: 0;
    }
  }

  &__link {
    display: flex;

    &__url {
      flex-grow: 1;
      background-color: $color-tertiary-lightest;
      padding: $spacing-unit/2 $spacing-unit;
    }
  }

  &__iframe {
    pre {
      margin: 0;
      padding: $spacing-unit/2 $spacing-unit;
      background-color: $color-tertiary-lightest;
    }
  }
}
</style>
