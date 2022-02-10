<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd-plugin">
    <div class="bsdd-plugin__header flex items-center">
      <span class="p-12">bSDD Connector</span>
    </div>
    <div class="bsdd-plugin__filters flex p-24">
      <div class="bsdd-plugin__filters__left p-r-12">
        <BIMDataDropdownList
          :list="availableLanguages"
          :perPage="20"
          :disabled="false"
          :closeOnElementClick="true"
          @element-click="onLanguageClick"
          width="100%"
        >
          <template #header>
            <span v-if="selectedLanguage">
              ({{ selectedLanguage.isoCode }}) {{ selectedLanguage.name }}
            </span>
            <span v-else>Language</span>
          </template>
          <template #element="{ element }">
            ({{ element.isoCode }}) {{ element.name }}
          </template>
        </BIMDataDropdownList>
      </div>
      <div class="bsdd-plugin__filters__right p-l-12">
        <BIMDataDropdownList
          :list="availableDomains"
          :perPage="20"
          :disabled="false"
          :closeOnElementClick="true"
          @element-click="onDomainClick"
          width="100%"
        >
          <template #header>
            <span v-if="selectedDomain"
              >{{ selectedDomain.name }} (v{{ selectedDomain.version }})</span
            >
            <span v-else>Domain</span>
          </template>
          <template #element="{ element }">
            {{ element.name }} (v{{ element.version }})
          </template>
        </BIMDataDropdownList>
      </div>
    </div>
    <p class="p-y-6 p-x-24">
      <strong>Current type:</strong>
      {{ currentIfcType ? currentIfcType : `no selected element` }}
    </p>
    <Properties
      :domain="selectedDomain"
      :language="selectedLanguage"
      :availableClasses="availableClasses"
    />
  </div>
</template>
<script>
import { BIMDataDropdownList } from "@bimdata/design-system/components.js";

import Properties from "./Properties.vue";
import { requestApi, toIfcType } from "./utils.js";
import _ from "lodash";

export default {
  name: "bsdd",
  components: {
    BIMDataDropdownList,
    Properties,
  },
  data() {
    return {
      availableDomains: [],
      selectedDomain: null,
      availableClasses: [],
      availableLanguages: [],
      selectedLanguage: null,
      currentIfcType: null,
      loading: false,
    };
  },
  watch: {
    currentIfcType() {
      this.fetchClasses();
    },
    selectedDomain() {
      this.fetchClasses();
    },
    selectedLanguage() {
      this.fetchClasses();
    },
  },
  async created() {
    this.loading = true;
    const [availableDomains, availableLanguages] = await Promise.all([
      requestApi("/Domain/v2", "GET"),
      requestApi("/Language/v1", "GET"),
    ]);
    this.availableDomains = _.sortBy(availableDomains, "name");
    this.availableLanguages = _.sortBy(availableLanguages, "name");
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
    onDomainClick(domain) {
      this.selectedDomain = domain;
    },
    onLanguageClick(language) {
      this.selectedLanguage = language;
    },
    async fetchClasses() {
      if (!this.selectedDomain || !this.currentIfcType) {
        return;
      }
      this.loading = true;
      const options = {
        params: {
          DomainNamespaceUri: this.selectedDomain.namespaceUri,
          RelatedIfcEntity: this.currentIfcType,
        },
      };
      if (this.selectedLanguage) {
        options.params.LanguageCode = this.selectedLanguage.isoCode;
      }
      let response = await requestApi("/SearchListOpen/v2", "GET", options);
      let availableClasses = _.sortBy(
        response.domains[0].classifications,
        "name"
      );
      if (availableClasses.length === 0) {
        const textSearchOptions = {
          params: {
            DomainNamespaceUris: [this.selectedDomain.namespaceUri],
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
.bsdd-plugin {
  height: 100%;
  background-color: var(--color-white);

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
    margin-top: var(--spacing-unit);
    background-color: var(--color-white);
  }
}
</style>
