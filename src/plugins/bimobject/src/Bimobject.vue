<template>
  <div class="bim-object">
    <div class="bim-object__search p-12">
      <BIMDataButton
        v-if="selected !== null"
        width="32px"
        @click="selected = null"
        class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square m-r-12"
      >
        <BIMDataIcon name="arrow" fill color="default" size="xxs" />
      </BIMDataButton>
      <BIMDataSearch
        width="100%"
        :placeholder="$t('bimObjectPlugin.search')"
        class="bimdata-search-bar__radius bimdata-search-bar__primary"
        v-model="searchText"
        @enter="getProducts"
        :clear="true"
        @clear="clear()"
      ></BIMDataSearch>
    </div>

    <div class="bim-object__content p-x-12 p-b-12" v-if="selected === null">
      <ul class="bimdata-list bimdata-cards">
        <BIMDataCard
          width="30%"
          v-for="item in results"
          :key="item.id"
          @click.native="getProperties(item)"
        >
          <template #content>
            <div class="bimdata-card_logo">
              <img :src="item.brand.imageUrl" />
            </div>
            <div class="bimdata-card_img">
              <img :src="item.imageUrl" />
            </div>
            <h4>{{ item.name }}</h4>
          </template>
        </BIMDataCard>
      </ul>
    </div>

    <div v-else class="product">
      <div class="product-item">
        <h4 class="product-item-name">{{ selected.name }}</h4>
        <div class="product-item__images">
          <div class="product-item-logo">
            <img :src="selected.brand.imageUrl" />
          </div>
          <div class="product-item-img m-y-12">
            <img :src="selected.imageUrl" />
          </div>
        </div>

        <BIMDataButton
          width="100%"
          @click="saveInBimdata"
          :disabled="buttonDisabled"
          class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
        >
          {{ $t("bimObjectPlugin.applySelected") }}
        </BIMDataButton>
        <div class="product-item-elem product-item-properties">
          <h3>Properties</h3>
          <ul class="bimdata-list product-item-list">
            <li v-for="pset in propertySets" :key="pset.id">
              <h6>{{ pset.name }}</h6>
              <ul class="bimdata-list">
                <li v-for="prop in pset.properties" :key="prop.id">
                  {{ prop.definition.name }} - {{ prop.value }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div
          class="product-item-elem product-item-classifications"
          v-if="classifications && classifications.length"
        >
          <h3>Classifications</h3>
          <ul class="bimdata-list product-item-list">
            <li v-for="classif in classifications" :key="classif.name">
              <span>{{ classif.name }}: </span>
              <span>{{ classif.notation }} - {{ classif.title }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <BIMDataLoading />
    </div>
  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataCard,
  BIMDataIcon,
  BIMDataLoading,
  BIMDataSearch,
} from "@bimdata/design-system/components.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bimobject",
  components: {
    BIMDataLoading,
    BIMDataSearch,
    BIMDataCard,
    BIMDataButton,
    BIMDataIcon,
  },
  data: function () {
    return {
      title: "BIMObject",
      accessToken: null,
      results: [],
      selected: null,
      propertySets: [],
      classifications: [],
      searchText: "",
      loading: false,
      buttonDisabled: true,
    };
  },
  computed: {
    headers() {
      return {
        Authorization: "Bearer " + this.$viewer.api.accessToken,
        "Content-Type": "application/json",
      };
    },
    bimobject_url() {
      const apiUrl = this.$viewer.api.apiUrl;
      if (apiUrl.includes("staging")) {
        return "https://bimobject-staging.bimdata.io";
      } else if (apiUrl.includes("next")) {
        return "https://bimobject-next.bimdata.io";
      }
      return "https://bimobject.bimdata.io";
    },
  },
  created() {
    this.getProducts();
    this.loading = false;

    const reactOnSelectionChange = () => {
      this.buttonDisabled = this.$viewer.state.selectedObjects.length === 0;
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
    async getProducts() {
      this.loading = true;
      this.selected = null;
      const res = await fetch(
        `${this.bimobject_url}/search/?searchText=${this.searchText}`,
        { headers: this.headers }
      );
      const json = await res.json();
      this.results = json.data;
      this.loading = false;
    },
    async clear() {
      this.getProducts();
    },
    async getProperties(selected) {
      this.loading = true;
      const productId = selected.id;
      const res = await fetch(
        `${this.bimobject_url}/details/?productId=${productId}`,
        { headers: this.headers }
      );
      const json = await res.json();
      this.selected = selected;
      this.propertySets = this.formatProperties(json.data);
      this.propertySets.push(this.formatAttributesAsPset(selected));
      this.classifications = this.formatClassifications(json.classifications);
      this.loading = false;
    },
    async saveInBimdata() {
      const selectedObjectIds = this.$viewer.state.selectedObjects.map(
        obj => obj.uuid
      );
      await Promise.all([
        this.setPropertiesToSelectecObjects(selectedObjectIds),
        this.setClassificationsToSelectecObjects(selectedObjectIds),
      ]);
      this.$viewer.globalContext.hub.emit(
        "updated-objects-properties",
        selectedObjectIds
      );
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: this.$t("bimObjectPlugin.successMessage"),
      });
    },
    async setPropertiesToSelectecObjects(selectedObjectIds) {
      if (this.propertySets.length === 0) {
        return;
      }
      const loadedIfc = this.$viewer.state.ifcs[0];
      const apiClient = new this.$viewer.api.apiClient.IfcApi();
      const propertySets = await apiClient.createPropertySet(
        this.$viewer.api.cloudId,
        loadedIfc.id,
        this.$viewer.api.projectId,
        this.propertySets
      );
      const psetIds = propertySets.map(pset => pset.id);
      const elementsPsetsRelations = selectedObjectIds.reduce(
        (acc, elementUuid) => {
          psetIds.forEach(id =>
            acc.push({ element_uuid: elementUuid, property_set_id: id })
          );
          return acc;
        },
        []
      );
      await apiClient.createPropertySetElementRelations(
        this.$viewer.api.cloudId,
        loadedIfc.id,
        this.$viewer.api.projectId,
        elementsPsetsRelations
      );
    },
    async setClassificationsToSelectecObjects(selectedObjectIds) {
      if (this.classifications.length === 0) {
        return;
      }
      const loadedIfc = this.$viewer.state.ifcs[0];
      const collaborationApi =
        new this.$viewer.api.apiClient.CollaborationApi();
      const ifcApi = new this.$viewer.api.apiClient.IfcApi();
      const classifications = await collaborationApi.createClassification(
        this.$viewer.api.cloudId,
        this.$viewer.api.projectId,
        this.classifications
      );
      const classifIds = classifications.map(classif => classif.id);
      const elementsClassifRelations = selectedObjectIds.reduce(
        (acc, elementUuid) => {
          classifIds.forEach(id =>
            acc.push({ element_uuid: elementUuid, classification_id: id })
          );
          return acc;
        },
        []
      );
      await ifcApi.createClassificationElementRelations(
        this.$viewer.api.cloudId,
        loadedIfc.id,
        this.$viewer.api.projectId,
        elementsClassifRelations
      );
    },
    formatAttributesAsPset(bimObject) {
      return {
        name: "bimobject attributes",
        description: "attributes extracted from bimobject",
        type: "IfcPropertySet",
        properties: [
          {
            value: bimObject.name,
            definition: {
              name: "name",
              description: "bimobject name",
              value_type: "string",
            },
          },
          {
            value: bimObject.brand.name,
            definition: {
              name: "brand",
              description: "bimobject brand",
              value_type: "string",
            },
          },
        ],
      };
    },
    getBimDataPropertyType(bimObjectType) {
      const mapping = {
        Text: "IfcText",
        Integer: "IfcInteger",
        Decimal: "IfcReal",
      };
      return mapping[bimObjectType] || bimObjectType;
    },
    formatProperties(bimOjectProperties) {
      return bimOjectProperties.map(pset => {
        return {
          name: pset.name,
          description: pset.description,
          type: "IfcPropertySet",
          properties: pset.properties.map(prop => {
            const propValue = prop.value.value;
            return {
              definition: {
                name: prop.definition.name,
                description: prop.definition.description,
                value_type: this.getBimDataPropertyType(prop.definition.type),
              },
              value:
                typeof propValue === "object"
                  ? JSON.stringify(propValue)
                  : propValue,
            };
          }),
        };
      });
    },
    formatClassifications(bimObjectClassifs) {
      return Object.keys(bimObjectClassifs)
        .filter(name => name !== "bimObjectCategory")
        .map(name => {
          return {
            name,
            notation: bimObjectClassifs[name].code,
            title: bimObjectClassifs[name].name,
          };
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/* custom BIM OBJECT - global */
.bim-object {
  height: 100%;

  /* custom BIM OBJECT - search */
  &__search {
    display: flex;
  }

  &__content {
    height: calc(100% - 56px);
    overflow: auto;
  }

  /* custom BIM OBJECT - list */
  .bimdata-cards {
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    .bimdata-card {
      flex-basis: 48%;
      &:not(:first-child, :nth-child(2)) {
        margin-top: 12px;
      }
      cursor: pointer;
      h4 {
        margin: 12px 0;
        text-align: center;
        font-weight: normal;
        word-break: break-word;
        color: var(--color-granite-light);
        font-size: 14px;
        line-height: 15px;
      }
      .bimdata-card_logo {
        height: 20px;
        display: flex;
        align-items: flex-start;
        img {
          max-height: 15px;
          max-width: 80px;
        }
      }
      .bimdata-card_img {
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 80%;
        }
      }
    }
  }

  /* custom BIM OBJECT SELECTED - product */
  .product {
    height: calc(100% - 56px);
    overflow: auto;
    .bimdata-btn__ghost {
      justify-content: flex-start;
    }
    .product-item {
      padding: 0 var(--spacing-unit) var(--spacing-unit);
      .product-item-name {
        margin: var(--spacing-unit) 0;
        font-size: 16px;
        line-height: 19px;
        font-weight: normal;
      }
      &__images {
        position: relative;
        .product-item-logo {
          position: absolute;
          top: 6px;
          left: 0px;
          background-color: white;
          img {
            max-height: 25px;
            max-width: 65px;
          }
        }

        .product-item-img {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      /* custom BIM OBJECT SELECTED - product - list */
      .product-item-elem {
        padding: 18px 0;
        h3 {
          margin: 0;
          font-size: 13px;
          line-height: 15px;
          color: var(--color-primary);
        }
        h6 {
          font-weight: bold;
          color: var(--color-primary);
          display: block;
          margin: 5px 0;
          font-size: 13px;
          line-height: 15px;
        }
        .product-item-list {
          color: var(--color-granite-light);
          font-size: 11px;
          line-height: 13px;
        }
      }

      /* custom BIM OBJECT SELECTED - product - properties */
      .product-item-properties {
        margin-top: 18px;
        border-top: 1px solid var(--color-silver);
        .product-item-list ul {
          li {
            padding: 6px;
            &:nth-child(even) {
              background-color: var(--color-silver-light);
            }
          }
        }
      }
      /* custom BIM OBJECT SELECTED - product - classifications */
      .product-item-classifications {
        border-top: 1px solid var(--color-silver);
        .product-item-list li {
          padding: 6px;
          span:first-child {
            font-weight: bold;
          }
          &:nth-child(even) {
            background-color: var(--color-silver-light);
          }
        }
      }
    }
  }
}
</style>
