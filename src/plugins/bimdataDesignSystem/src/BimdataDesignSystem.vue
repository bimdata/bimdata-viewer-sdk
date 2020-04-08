<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <!-- import BIMData BUTTON -->
    <div class="m-t-6 m-b-6 m-l-6 m-r-6">
      <BIMDataButton class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius">TEST</BIMDataButton>
    </div>

    <!-- import BIMData SEARCH -->
    <BIMDataSearch placeholder="Search" class="bimdata-search-bar__radius bimdata-search-bar__primary"></BIMDataSearch>

    <!-- import BIMData CARD -->
    <BIMDataCard titleHeader="header" submenuText="submenu">
      <template #headerIcons>
        header icons
      </template>
    </BIMDataCard>

    <!-- import BIMData CHECKBOX -->
    <BIMDataCheckbox text="text label here"></BIMDataCheckbox>

    <!-- import BIMData ICON -->
    <BIMDataIcon
      class="icon-chevron"
      icon-name="iconName"
      width="23"
      height="23"
      x="23"
      y="23"
    >
      <BIMDataSuccessIcon />
    </BIMDataIcon>
  </div>
</template>

<script>
import BIMDataComponents from '@bimdata/design-system';

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bimdataDesignSystem",
  components: {
    BIMDataButton : BIMDataComponents.BIMDataButton,
    BIMDataSearch : BIMDataComponents.BIMDataSearch,
    BIMDataCard : BIMDataComponents.BIMDataCard,
    BIMDataCheckbox : BIMDataComponents.BIMDataCheckbox,
    BIMDataIcon : BIMDataComponents.BIMDataIcon,
    BIMDataSuccessIcon : BIMDataComponents.BIMDataSuccessIcon

  },
  data() {
    return {
    }
  },
  methods: {
  }
};
</script>

<style type="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
@import "~@bimdata/design-system/dist/styles/component.css";
</style>
