<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd-plugin">
    <div class="bsdd-plugin__header flex items-center">
      <span class="p-12">PC Numérique</span>
    </div>
    <p class="p-y-6 p-x-24">
      <strong>Current type:</strong>
      {{ currentIfcType ? currentIfcType : `no selected element` }}
    </p>
    <Properties
      :availableClasses="availableClasses"
    />
  </div>
</template>
<script>

import Properties from "./Properties.vue";
import { requestApi, toIfcType } from "./utils.js";
import _ from "lodash";

const domainNamespaceUri = "http://identifier.buildingsmart.org/uri/bimdata/bimdata-1.0";

export default {
  name: "bsdd",
  components: {
    Properties,
  },
  data() {
    return {
      availableClasses: [],
      currentIfcType: null,
      loading: false,
    };
  },
  watch: {
    currentIfcType() {
      this.fetchClasses();
    },
  },
  async created() {
    this.loading = true;
    this.loading = false;

    this.$viewer.state.hub.on("objects-selected", this.updateCurrentIfcType);
    this.$viewer.state.hub.on("objects-deselected", this.updateCurrentIfcType);
  },
  methods: {
    updateCurrentIfcType() {
      if (this.$viewer.state.selectedObjects.length === 0) {
        this.currentIfcType = null;
        return;
      }
      const bimdataType =
        this.$viewer.state.selectedObjects[0] &&
        this.$viewer.state.selectedObjects[0].type;
      this.currentIfcType = toIfcType(bimdataType);
    },
    async fetchClasses() {
      if (!this.currentIfcType) {
        return;
      }
      this.loading = true;
      const options = {
        params: {
          DomainNamespaceUri: domainNamespaceUri,
          RelatedIfcEntity: this.currentIfcType,
        },
      };
      let response = await requestApi("/SearchListOpen/v2", "GET", options);
      let availableClasses = _.sortBy(
        response.domains[0].classifications,
        "name"
      );
      if (availableClasses.length === 0) {
        const textSearchOptions = {
          params: {
            DomainNamespaceUris: [domainNamespaceUri],
            SearchText: this.currentIfcType,
            TypeFilter: "Classifications",
          },
        };
        response = await requestApi(
          "/TextSearchListOpen/v5",
          "GET",
          textSearchOptions
        );
        availableClasses = _.sortBy(response.classifications, "name");
      }
      this.availableClasses = availableClasses;
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../node_modules/@bimdata/design-system/dist/scss/BIMData.scss";
.bsdd-plugin {
  height: 100%;
  background-color: $color-white;

  &__header {
    min-height: 44px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  }

  &__filters {
    &__left,
    &__right {
      flex: 1;
      .bimdata-dropdown-list {
        &:last-child {
          margin-top: 12px;
        }
      }
    }

    &__right {
      .bimdata-search-bar {
        margin: 12px auto;
      }
      ::v-deep.bimdata-tooltip {
        width: 100%;
        &__text {
          padding: 6px;
          width: 92%;
          height: fit-content;
          height: -moz-fit-content;
        }
      }
    }
  }

  p {
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin-top: $spacing-unit;
    background-color: $color-white;
  }
}
</style>
