<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd-properties">
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
    <div class="bsdd-properties__content flex">
      <div class="bimdata-table" v-if="rows.length > 0">
        <table>
          <thead>
            <tr>
              <th
                v-for="(cell, headerIndex) of header"
                :key="`header-${headerIndex}-${cell}`"
              >
                {{ cell }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) of rows" :key="`row-${rowIndex}`">
              <td>
                {{ row.propertySet }}
              </td>
              <td>
                {{ row.name }}
              </td>
              <td>
                <BIMDataInput v-model="row.value" :loading="false">
                </BIMDataInput>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>There is no property for this Class</div>
    </div>
    <div class="bsdd-properties__footer p-24 flex justify-center">
      <BIMDataButton
        color="primary"
        fill
        radius
        :disabled="
          $viewer.state.selectedObjects.length === 0 ||
          rows.filter(r => !!r.value).length === 0
        "
        @click="applyToSelection"
      >
        Apply to selection
      </BIMDataButton>
    </div>
  </div>
</template>
<script>
import BIMDataInput from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataInput.js";
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";
import BIMDataTooltip from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTooltip.js";
import BIMDataDropdownList from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataDropdownList.js";
import { requestApi } from "./utils.js";

export default {
  name: "bsdd",
  components: {
    BIMDataInput,
    BIMDataTooltip,
    BIMDataButton,
    BIMDataDropdownList,
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
      header: ["PSet", "Name", "Value"],
      rows: [],
    };
  },
  computed: {},
  watch: {
    selectedClass: {
      async handler(newClass) {
        if (!newClass) {
          this.rows = [];
          return;
        }
        this.fetchProperties(newClass);
      },
      immediate: true,
    },
    domain() {
      this.selectedClass = null;
    },
  },
  created() {},
  methods: {
    async fetchProperties(klass) {
      const options = {
        params: {
          namespaceUri: klass.namespaceUri,
        },
      };
      if (this.language) {
        options.params.languageCode = this.language.code;
      }
      let response = await requestApi("/Classification/v2", "GET", options);
      this.rows = (response.classificationProperties || []).map(prop => {
        prop.value = "";
        if (!prop.propertySet) {
          prop.propertySet = this.domain.name + " Properties";
        }
        return prop;
      });
    },
    onClassClick(klass) {
      this.selectedClass = klass;
    },
    async applyToSelection() {
      const apiClient = new this.$viewer.api.apiClient.IfcApi();
      const loadedIfc = this.$viewer.state.ifcs[0];
      const propertySets = this.rows.reduce((acc, prop) => {
        if (!acc[prop.propertySet]) {
          acc[prop.propertySet] = [];
        }
        acc[prop.propertySet].push(prop);
        return acc;
      }, {});
      const requests = Object.keys(propertySets).map(async pSet => {
        const properties = propertySets[pSet]
          .filter(prop => prop.value !== "")
          .map(prop => {
            return {
              value: prop.value,
              definition: {
                name: prop.name,
                type: "IfcProperty",
                description: prop.description,
                value_type: prop.dataType,
              },
            };
          });
        const data = {
          name: pSet,
          type: "IfcPropertySet",
          properties: properties,
        };
        const propertySet = await (
          await fetch(
            this.$viewer.api.apiUrl +
              `/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}/ifc/${loadedIfc.id}/propertyset`,
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
            property_set_id: propertySet.id,
          };
        });
        return apiClient.createPropertySetElementRelations(
          this.$viewer.api.cloudId,
          loadedIfc.id,
          this.$viewer.api.projectId,
          relations
        );
      });
      await Promise.all(requests);
      this.$viewer.globalContext.hub.emit("alert", {
        type: "success",
        message: "All objects have been updated",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../node_modules/@bimdata/design-system/dist/scss/BIMData.scss";
.bsdd-properties {
  height: 100%;
  padding: $spacing-unit;

  &__content {
    &__left,
    &__right {
      flex: 1;
    }
  }
  &__footer {
  }
  .bimdata-table {
    width: 100%;
    font-size: calculateEm(14px);
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: $primary-font;
      border-spacing: 0;
      tr {
        th,
        td {
          height: 50px;
          padding: 0 $spacing-unit;
          min-height: calc(#{$spacing-unit} * 2);
          font-size: calculateEm(11px);
          text-align: left;
        }
      }
      tbody {
        tr {
          td {
            color: $color-tertiary-darkest;
          }
          &:nth-child(odd) {
            background-color: $color-tertiary-lightest;
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
