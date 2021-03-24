<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bcf-premium flex flex-col justify-center items-center">
    <img class="m-b-24" src="../assets/logo-bimdata.svg" alt="" />
    <h6 class="bimdata-h6 color-primary primary-font">Viewer BCF BIM Server</h6>
    <p class="bimdata-text color-tertiary-darkest primary-font m-t-12">
      Premier projet gratuit, 45.00 € ht par projet par mois pour les projets
      suivants.
    </p>
    <BIMDataButton
      class="large-btn m-t-24"
      color="secondary"
      fill
      radius
      @click="open"
    >
      <BIMDataIcon name="chevron" size="xxxs" />
      <span>{{ $t("bcfKroqiPremiumService.activate") }}</span>
    </BIMDataButton>
  </div>
</template>

<script>
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bcfKroqiPremiumService",
  components: {
    BIMDataButton,
  },
  methods: {
    open() {
      const apiUrl = this.$viewer.api.apiUrl;
      const options = this.$viewer.pluginManager.cfg.bcfKroqiPremiumService;
      const org = options.organization;
      const kroqiDomain = options.kroqiDomain;
      let kroqiUrl;
      if (apiUrl.includes("staging")) {
        kroqiUrl = `https://${org}.${kroqiDomain}/#/account/subscription`;
      } else {
        kroqiUrl = `https://${org}.${kroqiDomain}/#/account/subscription`;
      }
      window.open(kroqiUrl, "_blank").focus();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../node_modules/@bimdata/design-system/dist/scss/utilities/text.scss";
.bcf-premium {
  height: 100%;
  padding: 0 90px;
  text-align: center;
}
</style>
