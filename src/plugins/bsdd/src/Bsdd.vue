<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd">
    <div class="bsdd__header flex items-center">
      <span class="p-12">bSDD connector</span>
    </div>
    <div class="bsdd__filters flex p-24">
      <div class="bsdd__filters__left p-r-12">
        <BIMDataDropdownList
          :list="availableLanguages"
          :perPage="20"
          :disabled="false"
          :closeOnElementClick="true"
          @element-click="onLanguageClick"
          width="100%"
        >
          <template #header>
            <span v-if="selectedLanguage"
              >({{ selectedLanguage.isoCode }})
              {{ selectedLanguage.name }}</span
            >
            <span v-else>Language</span>
          </template>
          <template #element="{ element }">
            ({{ element.isoCode }}) {{ element.name }}
          </template>
        </BIMDataDropdownList>
      </div>
      <div class="bsdd__filters__right p-l-12">
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
    <BIMDataTabs
      :tabs="tabs"
      width="100%"
      height="40px"
      tabSize="50%"
      @tab-selected="activeTab = $event"
      selected="share"
    />
    <div class="bsdd__content p-x-24 flex" v-if="activeTab.id === 'properties'">
      <Properties
        :domain="selectedDomain"
        :language="selectedLanguage"
        :availableClasses="availableClasses"
      />
    </div>
    <div v-else>
      <Classifications
        :domain="selectedDomain"
        :language="selectedLanguage"
        :availableClasses="availableClasses"
      />
    </div>
  </div>
</template>
<script>
import BIMDataDropdownList from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataDropdownList.js";
// import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";
import BIMDataTabs from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTabs.js";

import Classifications from "./Classifications.vue";
import Properties from "./Properties.vue";
import { requestApi } from "./utils.js";

function sortAlpha(prop) {
  return (a, b) => {
    if (a[prop] < b[prop]) {
      return -1;
    }
    if (a[prop] > b[prop]) {
      return 1;
    }
    return 0;
  };
}

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bsdd",
  components: {
    BIMDataDropdownList,
    // BIMDataButton,
    BIMDataTabs,
    Classifications,
    Properties,
  },
  data() {
    return {
      availableDomains: [],
      selectedDomain: null,
      availableClasses: [],
      availableLanguages: [],
      selectedLanguage: null,
      tabs: [
        { id: "properties", label: "Properties" },
        { id: "classifications", label: "Classifications" },
      ],
      activeTab: { id: "properties" },
    };
  },
  watch: {},
  async created() {
    const [availableDomains, availableLanguages] = await Promise.all([
      requestApi("/Domain/v2", "GET"),
      requestApi("/Language/v1", "GET"),
    ]);
    this.availableDomains = availableDomains.sort(sortAlpha("name"));
    this.availableLanguages = availableLanguages.sort(sortAlpha("name"));
  },
  methods: {
    onDomainClick(domain) {
      this.selectedDomain = domain;
      this.fetchClasses();
    },
    onLanguageClick(language) {
      this.selectedLanguage = language;
      this.fetchClasses();
    },
    async fetchClasses() {
      if (!this.selectedDomain) {
        return;
      }
      const options = {
        params: {
          DomainNamespaceUri: this.selectedDomain.namespaceUri,
        },
      };
      if (this.selectedLanguage) {
        options.params.LanguageCode = this.selectedLanguage.isoCode;
      }
      let response = await requestApi("/SearchListOpen/v2", "GET", options);
      this.availableClasses = response.domains[0].classifications.sort(
        sortAlpha("name")
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../node_modules/@bimdata/design-system/dist/scss/BIMData.scss";
.bsdd {
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
  &__content {
    &__left,
    &__right {
      flex: 1;
    }
  }
  &__footer {
  }
}
</style>
