<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bsdd-properties p-x-24">
    <BIMDataDropdownList
      :list="availableClasses"
      :perPage="20"
      :closeOnElementClick="true"
      width="100%"
      :disabled="availableClasses.length === 0"
      @element-click="onClassClick"
      class="m-t-18"
    >
      <template #header>
        <span v-if="selectedClass">{{ selectedClass.name }}</span>
        <span v-else>Classifications</span>
      </template>
      <template #element="{ element }">
        <BIMDataTooltip
          :message="element.definition"
          :className="tooltipClasses(availableClasses, element)"
        >
          <template #content>
            <span>{{ element.name }}</span></template
          >
        </BIMDataTooltip>
      </template>
    </BIMDataDropdownList>
    <!-- Object selection -->
    <BIMDataDropdownList
      :list="selectedObjects"
      :disabled="!selectedObjects.length"
      :perPage="30"
      elementKey="id"
      class="m-t-18"
    >
      <template #header>
        <div class="bimdata-properties__body flex items-center">
          <div class="bimdata-info-length m-r-6">
            {{ selectedObjects.length }}
          </div>
          <span>{{ getDisplayElementHeader() }}</span>
        </div>
      </template>
      <template #element="{ element, close }">
        <span
          :class="{ selected: element.id === displayedElement.id }"
          @click="
            close();
            showCurrentObjectProperties(element);
          "
          >{{ element.name || $t("properties.no_name") }}</span
        >
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
                <BIMDataCheckbox v-model="row.toUpdate"> </BIMDataCheckbox>
              </td>
              <td>
                {{ row.propertySet }}
              </td>
              <td class="property-name">
                <BIMDataTooltip
                  :message="row.description"
                  className="bimdata-tooltip--up bimdata-tooltip--primary"
                >
                  <template #content>
                    <span>{{ row.name }}</span></template
                  >
                </BIMDataTooltip>
              </td>
              <td>
                <BIMDataToggle
                  v-if="row.dataType === 'Boolean'"
                  :modelValue="row.value"
                  @update:modelValue="updateValue(row, $event)"
                >
                </BIMDataToggle>
                <BIMDataSelect
                  v-else-if="row.possibleValues"
                  :options="row.possibleValues.map(v => v.value)"
                  :modelValue="row.value"
                  @update:modelValue="updateValue(row, $event)"
                >
                  <template #header>
                    {{ row.value }}
                  </template>
                </BIMDataSelect>
                <BIMDataInput
                  v-else-if="
                    row.dataType === 'Real' || row.dataType === 'Integer'
                  "
                  type="number"
                  :modelValue="row.value"
                  @update:modelValue="updateValue(row, $event)"
                >
                </BIMDataInput>
                <BIMDataInput
                  v-else
                  :modelValue="row.value"
                  @update:modelValue="updateValue(row, $event)"
                >
                </BIMDataInput>
              </td>
              <td>
                {{ row.currentValue }}
              </td>
              <td>
                <BIMDataButton
                  color="primary"
                  fill
                  radius
                  :disabled="!row.toUpdate"
                  @click="createBCF(row)"
                  class="m-r-12"
                >
                  Generate
                </BIMDataButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bsdd-properties__content__empty p-y-30 text-center" v-else>
        There is no classification with properties in this dictionnary
      </div>
    </div>
    <div class="bsdd-properties__footer flex justify-center m-18">
      <BIMDataButton
        color="primary"
        fill
        radius
        :disabled="
          !displayedElement.id || rows.filter(r => r.toUpdate).length === 0
        "
        @click="applyToObject"
        class="m-r-12"
      >
        Apply to object
      </BIMDataButton>
      <BIMDataButton
        color="primary"
        fill
        radius
        :disabled="
          !displayedElement.id || rows.filter(r => r.toUpdate).length === 0
        "
        @click="applyToSelection"
        class="m-r-12"
      >
        Apply to selection
      </BIMDataButton>
    </div>
  </div>
</template>
<script>
import {
  BIMDataButton,
  BIMDataCheckbox,
  BIMDataDropdownList,
  BIMDataInput,
  BIMDataSelect,
  BIMDataToggle,
  BIMDataTooltip,
} from "@bimdata/design-system/components.js";
import { requestApi } from "./utils.js";
import _ from "lodash";

export default {
  name: "bsdd",
  components: {
    BIMDataInput,
    BIMDataTooltip,
    BIMDataButton,
    BIMDataDropdownList,
    BIMDataToggle,
    BIMDataSelect,
    BIMDataCheckbox,
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
      header: ["Update", "PSet", "Name", "Value", "Current Value", "BCF"],
      rows: [],
      displayedElement: {},
      displayedElementDetails: {},
      selectedObjects: [],
      loading: false,
    };
  },
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
    availableClasses() {
      this.selectedClass = null;
    },
    domain() {
      this.selectedClass = null;
    },
  },
  created() {
    this.selectedObjects = this.$viewer.state.selectedObjects;

    const reactOnSelectionChange = () => {
      this.selectedObjects = this.$viewer.state.selectedObjects;
      if (this.selectedObjects.length === 0) {
        this.displayedElement = {};
        this.displayedElementDetails = {};
        return;
      }
      if (
        !this.selectedObjects
          .map(obj => obj.id)
          .includes(this.displayedElement.id)
      ) {
        this.showCurrentObjectProperties(this.selectedObjects[0]);
      }
    };

    this.stateSubscriptions = [
      this.$viewer.state.hub.on("objects-deselected", reactOnSelectionChange),
      this.$viewer.state.hub.on("objects-selected", reactOnSelectionChange),
    ];
  },
  destroyed() {
    this.stateSubscriptions.forEach(sub => this.$viewer.state.hub.off(sub));
  },
  methods: {
    updateValue(row, value) {
      debugger;
      row.value = value;
      row.toUpdate = true;
    },
    async showCurrentObjectProperties(element) {
      this.displayedElement = element;
      const elementDetails =
        await new this.$viewer.api.apiClient.IfcApi().getElement(
          this.$viewer.api.cloudId,
          element.ifc.id,
          this.$viewer.api.projectId,
          element.uuid
        );
      this.displayedElementDetails = elementDetails;
      this.updateRowsWithCurrentProperties();
    },
    getDisplayElementHeader() {
      if (this.selectedObjects.length) {
        return (
          (this.displayedElement && this.displayedElement.name) ||
          this.$t("properties.no_name")
        );
      } else {
        return this.$t("properties.no_element");
      }
    },
    async fetchProperties(classification) {
      this.loading = true;
      const options = {
        params: {
          namespaceUri: classification.namespaceUri,
          includeChildClassificationReferences: true,
        },
      };
      if (this.language) {
        options.params.languageCode = this.language.code;
      }
      let response = await requestApi("/Classification/v3", "GET", options);
      const rows = (response.classificationProperties || []).map(prop => {
        prop.value = undefined;
        prop.currentValue = undefined;
        prop.toUpdate = false;
        if (!prop.propertySet) {
          prop.propertySet = this.domain.name + " Properties";
        }
        return prop;
      });
      this.rows = _.sortBy(rows, ["propertySet", "name"]);
      this.updateRowsWithCurrentProperties();
    },
    updateRowsWithCurrentProperties() {
      if (!this.displayedElement.id) {
        return;
      }
      const currentPSets = this.displayedElementDetails.property_sets;
      // Reset current object values:
      this.rows.forEach(row => (row.currentValue = undefined));
      this.rows.forEach(row => {
        const currentPSet = currentPSets.find(
          pset => pset.name === row.propertySet
        );
        if (currentPSet) {
          const currentProp = currentPSet.properties.find(
            prop => prop.definition.name === row.name
          );
          if (currentProp) {
            row.currentValue = currentProp.value;
          }
        }
      });
    },
    onClassClick(classification) {
      this.selectedClass = classification;
    },
    sanitizeEmptyValue(prop) {
      if (prop.value !== undefined) {
        return prop;
      }
      switch (prop.dataType) {
        case "Real":
          prop.value = 0;
          break;
        case "Boolean":
          prop.value = false;
          break;
        default:
          prop.value = "";
      }
    },
    async updateObject(element, elementDetails = null) {
      const apiClient = new this.$viewer.api.apiClient.IfcApi();
      const conflictingProperties = [];
      const createdProperties = [];

      if (!elementDetails) {
        elementDetails = await apiClient.getElement(
          this.$viewer.api.cloudId,
          element.ifc.id,
          this.$viewer.api.projectId,
          element.uuid
        );
      }
      const propertySets = this.rows
        .filter(prop => prop.toUpdate)
        .reduce((acc, prop) => {
          if (!acc[prop.propertySet]) {
            acc[prop.propertySet] = [];
          }
          this.sanitizeEmptyValue(prop);
          acc[prop.propertySet].push(prop);
          return acc;
        }, {});
      const propRequests = Object.entries(propertySets).map(
        async ([name, raw_props]) => {
          // Format properties to BIMData format
          const properties = raw_props.map(prop => {
            return {
              value: prop.value,
              definition: {
                name: prop.name,
                type: "IfcPropertySingleValue",
                description: prop.description,
              },
            };
          });
          // Find existing PSet with same name
          let existingPSet = elementDetails.property_sets.find(
            pSet => pSet.name === name
          );
          if (!existingPSet) {
            const data = {
              name: name,
              type: "IfcPropertySet",
              properties: properties,
            };
            existingPSet = await apiClient.createElementPropertySet(
              this.$viewer.api.cloudId,
              element.uuid,
              element.ifc.id,
              this.$viewer.api.projectId,
              data
            );
            createdProperties.push(...properties);
          } else {
            for (let prop of properties) {
              const existingProp = existingPSet.properties.find(
                apiProp => apiProp.definition.name === prop.definition.name
              );
              if (!existingProp) {
                await apiClient.createElementPropertySetProperty(
                  this.$viewer.api.cloudId,
                  element.uuid,
                  element.ifc.id,
                  this.$viewer.api.projectId,
                  existingPSet.id,
                  prop
                );
              } else {
                if (existingProp.value !== prop.value) {
                  await apiClient.updateElementPropertySetProperty(
                    this.$viewer.api.cloudId,
                    element.uuid,
                    existingProp.id,
                    element.ifc.id,
                    this.$viewer.api.projectId,
                    existingPSet.id,
                    { value: prop.value }
                  );
                  conflictingProperties.push(prop);
                }
              }
            }
          }
        }
      );
      await Promise.all(propRequests);
      this.$viewer.globalContext.hub.emit("properties-update", {
        object: element,
      });
    },
    async applyToObject() {
      await this.updateObject(
        this.displayedElement,
        this.displayedElementDetails
      );
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: "Object updated",
      });
    },
    async applyToSelection() {
      await Promise.all(
        this.selectedObjects.map(object => this.updateObject(object))
      );
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: "All selected objects updated",
      });
    },
    tooltipClasses(availableClasses, element) {
      const lastElementIndex = availableClasses.indexOf(element);
      const isLastElement = lastElementIndex === availableClasses.length - 1;
      if (isLastElement) {
        return `bimdata-tooltip--up bimdata-tooltip--primary bimdata-tooltip--arrow`;
      } else {
        return `bimdata-tooltip--bottom bimdata-tooltip--primary bimdata-tooltip--arrow`;
      }
    },
    async createBCF(row) {
      this.sanitizeEmptyValue(row);
      const apiClient = new this.$viewer.api.apiClient.BcfApi();
      const title = `Confirm value for ${this.displayedElement.name} ${row.name}`;
      let description = `Please validate value ${row.value} for property ${row.name} in PSet ${row.propertySet}`;
      const type = `Clash`;
      const data = {
        title,
        description,
        topic_type: type,
        topic_status: "Opened",
        labels: ["Properties"],
        viewpoints: [
          {
            components: {
              selection: [
                {
                  ifc_guid: this.displayedElement.uuid,
                  originating_system: "BIMData.io bSDD plugin",
                },
              ],
            },
          },
        ],
      };
      await apiClient.createFullTopic(this.$viewer.api.projectId, data);
      try {
        await this.$viewer.globalContext.getPlugins("bcf")[0].fetchTopics();
      } catch (e) {
        console.log("BCF not initialized");
      }
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: "BCF created",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.bsdd-properties {
  height: auto;
  background-color: var(--color-white);
  &__content {
    &__left,
    &__right {
      flex: 1;
    }
    &__empty {
      width: 100%;
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
          min-width: 150px;
          &:first-child {
            min-width: 50px;
          }
        }
      }
      tbody {
        tr {
          td {
            color: var(--color-granite);
            &.property-name {
              font-weight: bold;
            }
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
    ::v-deep.toggle__button .toggle__switch {
      margin: 0 0px;
    }
  }
  .bimdata-dropdown-list {
    ::v-deep.bimdata-tooltip {
      width: 100%;
    }
    ::v-deep.bimdata-tooltip__text {
      text-align: left;
      left: 0;
      transform: none;
      &::before {
        left: 5%;
      }
    }
  }
  ::v-deep.bimdata-dropdown-list__content {
    width: 100%;
  }
  ::v-deep.bimdata-list {
    li {
      padding: 6px 12px;
    }
  }
  ::v-deep.bimdata-tooltip__text {
    padding: 10px;
    font-size: 11px;
    font-weight: normal;
  }
}
</style>
