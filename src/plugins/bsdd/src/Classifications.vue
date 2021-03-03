<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="classifications">
    <BIMDataDropdownList
      :list="availableClasses"
      :perPage="20"
      :closeOnElementClick="true"
      width="100%"
      :disabled="availableClasses.length === 0"
      @element-click="onClassClick"
    >
      <template #header>
        <span v-if="selectedClass">{{ selectedClass.name }}</span>
        <span v-else>Related Classes</span>
      </template>
      <template #element="{ element }">
        <BIMDataTooltip
          :message="element.definition"
          className="bimdata-tooltip--bottom bimdata-tooltip--primary bimdata-tooltip--arrow"
        >
          <template #content
            ><span>{{ element.name }}</span></template
          >
        </BIMDataTooltip>
      </template>
    </BIMDataDropdownList>
    <div v-if="classDetails">
      <ul>
        <li v-for="item of classDetails.classText" :key="item">
          {{ item }}
        </li>
      </ul>
    </div>
    <BIMDataButton
      color="primary"
      fill
      radius
      :disabled="$viewer.state.selectedObjects.length === 0"
      @click="applyToSelection"
    >
      Apply to selection
    </BIMDataButton>
  </div>
</template>

<script>
import { requestApi } from "./utils.js";
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";
import BIMDataDropdownList from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataDropdownList.js";
import BIMDataTooltip from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTooltip.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "Classifications",
  components: {
    BIMDataButton,
    BIMDataDropdownList,
    BIMDataTooltip,
  },
  props: {
    language: {
      type: Object,
      required: true,
    },
    domain: {
      type: Object,
      required: true,
    },
    availableClasses: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedClass: null,
      classDetails: null,
    };
  },
  watch: {
    selectedClass: {
      async handler(newClass) {
        if (!newClass) {
          this.classDetails = null;
          return;
        }
        this.fetchClass(newClass);
      },
      immediate: true,
    },
    domain() {
      this.selectedClass = null;
    },
  },
  created() {},
  methods: {
    onClassClick(klass) {
      this.selectedClass = klass;
    },
    async fetchClass(klass) {
      const options = {
        params: {
          namespaceUri: klass.namespaceUri,
        },
      };
      if (this.language) {
        options.params.LanguageCode = this.language.code;
      }
      const discarded = [
        "namespaceUri",
        "parentClassificationReference",
        "status",
        "activationDateUtc",
        "versionDateUtc",
        "classificationProperties",
      ];
      this.classDetails = await requestApi(
        "/Classification/v2",
        "GET",
        options
      );
      const classText = [];
      // rajouter des champs
      Object.keys(this.classDetails).forEach(k => {
        if (!discarded.includes(k)) {
          classText.push(k + ": " + this.classDetails[k]);
        }
      });
      this.classDetails.classText = classText;
    },
    async applyToSelection() {
      const ifcApi = new this.$viewer.api.apiClient.IfcApi();
      const collaborationApi = new this.$viewer.api.apiClient.CollaborationApi();
      const loadedIfc = this.$viewer.state.ifcs[0];
      console.log(ifcApi, collaborationApi, loadedIfc);
      const data = {
        name: this.domain.name,
        notation: this.classDetails.code,
        title: this.classDetails.name,
      };
      const classification = await (
        await fetch(
          this.$viewer.api.apiUrl +
            `/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}/classification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + this.$viewer.api.accessToken,
            },
            body: JSON.stringify(data),
          }
        )
      ).json();
      const relations = this.$viewer.state.selectedObjects.map(obj => {
        return {
          element_uuid: obj.uuid,
          classification_id: classification.id,
        };
      });
      await ifcApi.createClassificationElementRelations(
        this.$viewer.api.cloudId,
        loadedIfc.id,
        this.$viewer.api.projectId,
        relations
      );
      this.$viewer.globalContext
        .getPlugins("structure-properties")
        .forEach(plugin => {
          plugin.reloadTrees();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../node_modules/@bimdata/design-system/dist/scss/BIMData.scss";
.classifications {
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
