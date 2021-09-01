<template>
  <div class="share-tab">
    <template v-if="shareUrl === null">
      <div class="share-tab__body">
        <BIMDataInput
          :placeholder="$t('IframeSharePlugin.share_name')"
          v-model="shareName"
        />
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
            {{ shareUrl }}
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
  BIMDataInput,
} from "@bimdata/design-system/components.js";
import shareIcon from "../assets/share.svg";

export default {
  components: {
    BIMDataButton,
    BIMDataCheckbox,
    BIMDataIcon,
    BIMDataInput,
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
      shareName: "",
      shareUrl: null,
      keepCameraSetup: false,
      expirationDate: null,
    };
  },
  computed: {
    iframeString() {
      return (
        `<iframe\n` +
        `  width="560" height="315"\n` +
        `  src="${this.shareUrl}"\n` +
        `  frameborder="0"\n` +
        `  allowfullscreen>\n` +
        `</iframe>`
      );
    },
  },
  methods: {
    async share() {
      const body = {
        name: this.shareName,
        ifc_ids: this.$viewer.state.ifcs.map(ifc => ifc.id),
        locale: this.$i18n.locale,
      };
      // Note: if no expiration date is given, a default expiration date
      // equilvalent to the current date with year 2099 will be set in the backend.
      if (this.expirationDate) {
        body.expires_at = this.expirationDate.toISOString();
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

      this.shareUrl = `${this.shareBackendUrl}/${id}`;
    },
    async copy(text) {
      await navigator.clipboard.writeText(text);
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: this.$t("IframeSharePlugin.copy_success"),
      });
    },
    copyUrl() {
      this.copy(this.shareUrl);
    },
    copyIframe() {
      this.copy(this.shareUrl);
    },
  },
};
</script>

<style scoped lang="scss">
@import "../node_modules/@bimdata/design-system/dist/scss/_BIMDataVariables.scss";

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
      overflow: auto;
      background-color: $color-tertiary-lightest;
    }
  }
}
</style>
