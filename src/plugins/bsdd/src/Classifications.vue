<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd">
    <BIMDataDropdownList
      :list="availableClasses"
      :perPage="20"
      :closeOnElementClick="true"
      width="100%"
      :disabled="availableClasses.length === 0"
      @element-click="onClassClick"
      class="m-t-12"
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
    <div class="bsdd__content flex">
      <div
        class="bimdata-table m-t-12"
        v-if="classDetails && classDetails.classText.length > 0"
      >
        <table>
          <thead></thead>
          <tbody>
            <tr v-for="item of classDetails.classText" :key="item">
              <td>
                {{ item }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>There is no property for this Class</div>
    </div>
    <div class="bsdd__footer p-24 flex justify-center">
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
  </div>
</template>

<script>
import { requestApi } from "./utils.js";
import {
  BIMDataButton,
  BIMDataDropdownList,
  BIMDataTooltip,
} from "@bimdata/design-system/components.js";

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
      header: [],
      rows: [],
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
      Object.keys(this.classDetails).forEach(k => {
        if (!discarded.includes(k)) {
          classText.push(k + ": " + this.classDetails[k]);
        }
      });
      this.classDetails.classText = classText;
    },
    async applyToSelection() {
      const ifcApi = new this.$viewer.api.apiClient.IfcApi();
      const loadedIfc = this.$viewer.state.ifcs[0];
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
.bsdd {
  height: 100%;
  padding: var(--spacing-unit);

  &__content {
    &__left,
    &__right {
      flex: 1;
    }
  }

  .bimdata-table {
    width: 100%;
    font-size: 14px;
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--primary-font);
      border-spacing: 0;
      tr {
        th,
        td {
          height: 50px;
          padding: 0 var(--spacing-unit);
          min-height: calc(var(--spacing-unit) * 2);
          font-size: 11px;
          text-align: left;
        }
      }
      tbody {
        tr {
          td {
            color: var(--color-granite);
          }
          &:nth-child(odd) {
            background-color: var(--color-silver-light);
          }
        }
      }
    }
    &__compensated {
      table {
        tr {
          th,
          td {
            height: 35px;
          }
        }
      }
    }
  }
}
</style>
