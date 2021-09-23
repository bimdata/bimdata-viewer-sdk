<template>
  <div class="share-creation-form">
    <BIMDataInput
      :placeholder="
        $t('IframeSharePlugin.ShareTab.ShareCreationForm.nameInputLabel')
      "
      v-model="shareName"
    />

    <!-- <Datepicker
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
    </Datepicker> -->

    <BIMDataCheckbox
      :text="$t('IframeSharePlugin.ShareTab.ShareCreationForm.keepCameraSetup')"
      v-model="keepCameraSetup"
    />

    <BIMDataButton color="primary" fill radius @click="createShareLink">
      <BIMDataIcon name="chevron" size="xxxs" margin="0 6px 0 0" />
      <span>{{
        $t("IframeSharePlugin.ShareTab.ShareCreationForm.createLinkButtonText")
      }}</span>
    </BIMDataButton>
  </div>
</template>

<script>
// import Datepicker from "vuejs-datepicker";
// import fr from "vuejs-datepicker/dist/locale/translations/fr";
// import en from "vuejs-datepicker/dist/locale/translations/en";
import {
  BIMDataButton,
  BIMDataCheckbox,
  BIMDataIcon,
  BIMDataInput,
} from "@bimdata/design-system/components.js";

export default {
  components: {
    BIMDataButton,
    BIMDataCheckbox,
    BIMDataIcon,
    BIMDataInput,
    // DatePicker,
  },
  props: {
    shareBackendUrl: {
      type: String,
    },
  },
  emits: ["share-created"],
  data() {
    return {
      // en,
      // fr,
      expirationDate: null,
      keepCameraSetup: false,
      shareName: "",
      shareUrl: null,
    };
  },
  methods: {
    async createShareLink() {
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

      const shareId = (await response.json()).id;
      this.shareUrl = `${this.shareBackendUrl}/${shareId}`;

      this.$emit("share-created", this.shareUrl);
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
  gap: calc(var(--spacing-unit) * 2);
}
</style>
