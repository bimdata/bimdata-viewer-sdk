<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div>
    <!-- import BIMData BUTTON -->
    <div class="m-t-6 m-b-6 m-l-6 m-r-6">
      <BIMDataButton
        class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
        >TEST</BIMDataButton
      >
    </div>

    <!-- import BIMData CARD -->
    <BIMDataCard
      class="m-t-12 m-b-12 m-l-12 m-r-12"
      titleHeader="header"
      submenuText="submenu"
    >
      <template #headerIcons> header icons </template>
      <template #content> content here </template>
    </BIMDataCard>

    <!-- import BIMData CHECKBOX -->
    <BIMDataCheckbox
      class="m-t-12 m-b-12 m-l-6 m-r-6"
      text="text label here"
    ></BIMDataCheckbox>

    <!-- import BIMData ICON -->
    <BIMDataIcon
      class="icon-success m-l-6 m-r-6"
      icon-name="iconName"
      width="23"
      height="23"
      x="23"
      y="23"
    >
      <BIMDataSuccessIcon />
    </BIMDataIcon>

    <!-- import BIMData INPUT -->
    <BIMDataInput
      class="m-l-6 m-r-6"
      v-model="textInput"
      placeholder="Your placeholder here"
      :error="!textInput"
      errorMessage="your error message here"
      :loading="false"
    />

    <!-- import BIMData SEARCH -->
    <BIMDataSearch
      v-model="searchText"
      placeholder="Search"
      class="bimdata-search-bar__radius bimdata-search-bar__primary m-t-6 m-b-6 m-l-6 m-r-6"
    ></BIMDataSearch>
  </div>
</template>

<script>
import BIMDataComponents from "../node_modules/@bimdata/design-system";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bimdataDesignSystem",
  components: {
    BIMDataButton: BIMDataComponents.BIMDataButton,
    BIMDataCard: BIMDataComponents.BIMDataCard,
    BIMDataCheckbox: BIMDataComponents.BIMDataCheckbox,
    BIMDataIcon: BIMDataComponents.BIMDataIcon,
    BIMDataInput: BIMDataComponents.BIMDataInput,
    BIMDataSuccessIcon: BIMDataComponents.BIMDataSuccessIcon,
    BIMDataSearch: BIMDataComponents.BIMDataSearch,
  },
  data() {
    return {
      searchText: "",
    };
  },
  methods: {},
};
</script>

<style type="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
@import "~@bimdata/design-system/dist/styles/component.css";
</style>
