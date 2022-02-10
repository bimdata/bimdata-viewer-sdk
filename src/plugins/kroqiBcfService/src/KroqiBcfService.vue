<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bcf-premium flex flex-col justify-around items-center">
    <div class="bcf-premium__content flex flex-col justify-center items-center">
      <img class="m-b-24" src="../assets/logo-bimdata.svg" alt="" />
      <h6 class="bimdata-h6 color-primary primary-font">
        Viewer BCF BIM Server
      </h6>
      <p class="color-tertiary-darkest primary-font m-t-18">
        Premier projet gratuit, <strong>45.00€ ht</strong> par projet par mois
        pour les projets suivants.
      </p>
      <BIMDataButton
        v-if="userIsAdmin"
        class="large-btn m-t-18"
        color="secondary"
        fill
        radius
        @click="open"
      >
        <BIMDataIcon name="chevron" size="xxxs" />
        <span>{{ $t("bcfKroqiPremiumService.activate") }}</span>
      </BIMDataButton>
      <p class="color-tertiary-darkest primary-font m-y-18" v-else>
        Veuillez contacter la personne qui administre votre organisation Kroqi
        pour activer cette fonctionnalité.
      </p>
    </div>
    <p class="color-tertiary-dark primary-font m-y-24">
      Vous devrez recharger cette page après activation pour accéder au service
      BCF.
    </p>
  </div>
</template>

<script>
import { BIMDataButton } from "@bimdata/design-system/components.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bcfKroqiPremiumService",
  components: {
    BIMDataButton,
  },
  computed: {
    userIsAdmin() {
      return this.$viewer.pluginManager.cfg.bcfKroqiPremiumService.userIsAdmin;
    },
  },
  methods: {
    open() {
      const options = this.$viewer.pluginManager.cfg.bcfKroqiPremiumService;
      const org = options.organization;
      const kroqiDomain = options.kroqiDomain;
      const service = options.service;
      const kroqiProjectId = options.kroqiProjectId;
      const kroqiUrl = `https://${org}.${kroqiDomain}/#/account/subscription/?service=${service}&project=${kroqiProjectId}`;
      window.open(kroqiUrl, "_blank").focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.bcf-premium {
  height: 100%;
  padding: 0 80px;
  text-align: center;
  &__content {
    height: 80%;
  }
  p {
    line-height: 1.4;
  }
  p.color-tertiary-dark {
    font-size: 12px;
  }
}
</style>
