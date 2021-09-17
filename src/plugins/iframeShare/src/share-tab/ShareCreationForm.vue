<template>
  <div class="share-creation-form">
    <BIMDataInput
      :placeholder="$t('IframeSharePlugin.ShareCreationForm.nameInputLabel')"
      :error="hasError"
      :errorMessage="$t('IframeSharePlugin.ShareCreationForm.nameInputError')"
      @update:modelValue="hasError = false"
      v-model="shareName"
    />

    <TokenDurationInput v-model="tokenDuration" />

    <BIMDataCheckbox
      :text="$t('IframeSharePlugin.ShareCreationForm.keepCameraSetup')"
      v-model="keepCameraSetup"
    />

    <BIMDataButton color="primary" fill radius @click="createShareLink">
      <BIMDataIcon name="chevron" size="xxxs" margin="0 6px 0 0" />
      <span>
        {{ $t("IframeSharePlugin.ShareCreationForm.createLinkButtonText") }}
      </span>
    </BIMDataButton>
  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataCheckbox,
  BIMDataIcon,
  BIMDataInput,
} from "@bimdata/design-system/components.js";

import TokenDurationInput from "./TokenDurationInput.vue";

export default {
  components: {
    BIMDataButton,
    BIMDataCheckbox,
    BIMDataIcon,
    BIMDataInput,
    TokenDurationInput,
  },
  props: {
    shareBackendUrl: {
      type: String,
    },
  },
  emits: ["share-created"],
  data() {
    return {
      hasError: false,
      keepCameraSetup: false,
      shareName: "",
      tokenDuration: 0,
    };
  },
  methods: {
    async createShareLink() {
      if (!this.shareName) {
        this.hasError = true;
        return;
      }

      const body = {
        name: this.shareName,
        ifc_ids: this.$viewer.state.ifcs.map(ifc => ifc.id),
        locale: this.$i18n.locale,
      };

      if (this.tokenDuration) {
        const date = new Date();
        const today = date.getDate();
        date.setDate(today + this.tokenDuration);
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

      const share = await response.json();

      this.$emit("share-created", share);
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: this.$t(
          "IframeSharePlugin.ShareCreationForm.createSuccessMessage"
        ),
      });
    },
  },
};
</script>

<style scoped lang="scss">
.share-creation-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--spacing-unit) * 3);
}
</style>
