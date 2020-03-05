<template>
  <div class="bim-object">
    <div class="bim-object__search">
      <button @click=getProducts>
        <img src="../assets/search-icon.svg" width="16" height="16" alt="picto search" />
      </button>
      <input type="text" v-model="searchText" :placeholder="$t('bimObjectPlugin.search')" @keyup.enter="getProducts">
      <button @click=clear v-if="searchText !== ''">
        <img src="../assets/close-icon.svg" width="16" height="16" alt="picto close" />
      </button>
    </div>

    <div v-if="selected === null">
      <ul class="products-wrapper">
        <li class="product-card" v-for="item in results" @click="getProperties(item)" :key="item.id">
          <div class="product-card_logo">
            <img :src="item.brand.imageUrl">
          </div>
          <div class="product-card_img">
            <img :src="item.imageUrl">
          </div>
          <h4>{{ item.name }}</h4>
        </li>
      </ul>
    </div>

    <div v-else class="product">
      <button @click="selected=null" class="btn-shadow">
        <img src="../assets/arrow-icon.svg" width="14" height="14" alt="picto go back" />
        {{ $t('bimObjectPlugin.goBack') }}
      </button>
      <div class="product-item">
        <h4 class="product-item-name">{{ selected.name }}</h4>
        <div class="product-item-logo">
          <img :src="selected.brand.imageUrl">
        </div>
        <div class="product-item-img">
          <img :src="selected.imageUrl">
        </div>

        <button class="product-item-btn" @click="saveInBimdata" :disabled="$utils.getSelectedObjectIds().length === 0">
          {{ $t('bimObjectPlugin.applySelected') }}
        </button>
        <div class="product-item-elem product-item-properties">
          <h3>Properties</h3>
          <ul class="product-item-list">
            <li v-for="pset in propertySets" :key="pset.id">
              <h6>{{ pset.name }}</h6>
              <ul>
                <li v-for="prop in pset.properties" :key="prop.id">
                  {{ prop.definition.name }} - {{ prop.value }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="product-item-elem product-item-classifications">
          <h3>Classifications</h3>
          <ul class="product-item-list">
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
import BIMDataLoading from './BIMDataLoading.vue';

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "bimobject",
  components: {
    BIMDataLoading
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
      loading: false
    }
  },
  computed: {
    headers() {
      return {
        'Authorization': 'Bearer ' + this.$utils.getAccessToken(),
        'Content-Type': 'application/json'
      }
    },
    bimobject_url() {
      const apiUrl = this.$store.state.viewer.viewerComponent.cfg.apiUrl;
      if (apiUrl.includes('staging')) {
        return 'https://bimobject-staging.bimdata.io';
      } else if (apiUrl.includes('next')) {
        return 'https://bimobject-next.bimdata.io';
      }
      return 'https://bimobject.bimdata.io';
    }
  },
  methods: {
    async getProducts() {
      this.loading = true;
      this.selected = null;
      const res = await fetch(`${this.bimobject_url}/search/?searchText=${this.searchText}`, { headers: this.headers });
      const json = await res.json();
      this.results = json.data;
      this.loading = false;
    },
    async clear() {
      this.searchText = ""
      this.getProducts();
    },
    async getProperties(selected) {
      this.loading = true;
      const productId = selected.id;
      const res = await fetch(`${this.bimobject_url}/details/?productId=${productId}`, { headers: this.headers });
      const json = await res.json();
      this.selected = selected;
      this.propertySets = this.formatProperties(json.data);
      this.propertySets.push(this.formatAttributesAsPset(selected));
      this.classifications = this.formatClassifications(json.classifications);
      this.loading = false;
    },
    async saveInBimdata() {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      await Promise.all([
        this.setPropertiesToSelectecObjects(selectedObjectIds),
        this.setClassificationsToSelectecObjects(selectedObjectIds)
      ]);
      this.$hub.emit('updated-objects-properties', selectedObjectIds);
      this.$hub.emit('alert', {
        type: 'success',
        message: this.$t('bimObjectPlugin.successMessage')
      });
    },
    async setPropertiesToSelectecObjects(selectedObjectIds) {
      if (this.propertySets.length === 0) {
        return;
      }
      const loadedIfc = this.$utils.getSelectedIfcs()[0]
      const apiClient = new this.$bimdataApiClient.IfcApi();
      const propertySets = await apiClient.createPropertySet(
        this.$utils.getCloudId(),
        loadedIfc.id,
        this.$utils.getProjectId(),
        this.propertySets
      );
      const psetIds = propertySets.map(pset => pset.id);
      const elementsPsetsRelations = selectedObjectIds.reduce((acc, elementUuid) => {
        psetIds.forEach(id => acc.push({ element_uuid: elementUuid, property_set_id: id }));
        return acc;
      }, []);
      await apiClient.createPropertySetElementRelations(
        this.$utils.getCloudId(),
        loadedIfc.id,
        this.$utils.getProjectId(),
        elementsPsetsRelations
      );
    },
    async setClassificationsToSelectecObjects(selectedObjectIds) {
      if (this.classifications.length === 0) {
        return;
      }
      const loadedIfc = this.$utils.getSelectedIfcs()[0]
      const collaborationApi = new this.$bimdataApiClient.CollaborationApi();
      const ifcApi = new this.$bimdataApiClient.IfcApi();
      const classifications = await collaborationApi.createClassification(
        this.$utils.getCloudId(),
        this.$utils.getProjectId(),
        this.classifications
      );
      const classifIds = classifications.map(classif => classif.id);
      const elementsClassifRelations = selectedObjectIds.reduce((acc, elementUuid) => {
        classifIds.forEach(id => acc.push({ element_uuid: elementUuid, classification_id: id }));
        return acc;
      }, []);
      await ifcApi.createClassificationElementRelations(
        this.$utils.getCloudId(),
        loadedIfc.id,
        this.$utils.getProjectId(),
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
              value_type: "string"
            }
          },
          {
            value: bimObject.brand.name,
            definition: {
              name: "brand",
              description: "bimobject brand",
              value_type: "string"
            }
          },
        ]
      }
    },
    getBimDataPropertyType(bimObjectType) {
      const mapping = {
        "Text": "string",
        "Integer": "integer",
        "Decimal": "float"
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
              value: typeof (propValue) === "object" ? JSON.stringify(propValue) : propValue
            }
          })
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
            title: bimObjectClassifs[name].name
          }
        });
    }
  },
  created() {
    this.getProducts();
    this.loading = false;
  }
};
</script>

<style scoped>
/* custom BIM OBJECT - global */
.bim-object {
  padding: 12px;
}
.bim-object button {
  padding: 0;
  height: 32px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bim-object ul, .bim-object ul li {
  padding: 0;
  margin: 0;
  list-style-type: none;
}
.bim-object input:focus,
.bim-object button:focus {
  outline: none;
}

/* custom BIM OBJECT - search */
.bim-object .bim-object__search {
  display: flex;
  background-color: #f7f7f7;
}
.bim-object .bim-object__search input {
  width: 100%;
  height: 32px;
  border: none;
  background-color: transparent;
}
.bim-object .bim-object__search button {
  padding: 0;
  width: 50px;
  background-color: transparent;
}

/* custom BIM OBJECT - list */
.bim-object .products-wrapper {
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.bim-object .products-wrapper .product-card {
  margin-top: 12px;
  padding: 12px;
  min-height: 160px;
  display: flex;
  position: relative;
  flex-direction: column;
  flex-basis: 31%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .1);
  cursor: pointer;
}
.bim-object .products-wrapper .product-card:nth-child(1n) {
  margin-right: 12px;
}
.bim-object .products-wrapper .product-card:nth-child(3n) {
  margin-right: 0;
}
.bim-object .products-wrapper .product-card h4 {
  margin: 12px 0;
  text-align: center;
  font-weight: normal;
  word-break: break-word;
  color: #7a7a7a;
  font-size: 14px;
  line-height: 15px;
}
.bim-object .products-wrapper .product-card .product-card_logo {
  height: 20px;
  display: flex;
  align-items: flex-start;
}
.bim-object .products-wrapper .product-card .product-card_logo img {
  max-height: 15px;
  max-width: 80px;
}
.bim-object .products-wrapper .product-card .product-card_img {
  display: flex;
  align-items: center;
  justify-content: center;
}
.bim-object .products-wrapper .product-card .product-card_img img {
  width: 80%;
}

/* custom BIM OBJECT SELECTED - product */
.bim-object .product {
  margin-top: 24px;
}
.bim-object .product .btn-shadow {
  background-color: transparent;
}
.bim-object .product .btn-shadow svg {
  margin-right: 6px;
}
.bim-object .product .product-item{
  padding: 0 14px 14px;
}
.bim-object .product .product-item .product-item-name{
  margin: 14px 0 4px;
  font-size: 16px;
  line-height: 19px;
  font-weight: normal;
}
.bim-object .product .product-item .product-item-logo img{
  max-height: 25px;
  max-width: 65px;
}
.bim-object .product .product-item .product-item-img{
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  margin: 4px 0 22px;
}
.bim-object .product .product-item .product-item-btn{
  width: 100%;
  background: #2F374A;
  border-radius: 3px;
  color: #fff;
  font-size: 12px;
}

.bim-object .product .product-item .product-item-btn:disabled {
  background: #d8d8d8;
}

/* custom BIM OBJECT SELECTED - product - list */
.bim-object .product .product-item .product-item-elem{
  padding: 22px 0;
  border-bottom: 1px solid lightgray;
}
.bim-object .product .product-item .product-item-elem h3{
  margin: 0;
  font-size: 13px;
  line-height: 15px;
  color: #30374B;
}
.bim-object .product .product-item .product-item-elem h6 {
  font-weight: bold;
  color: #2f374a;
  display: block;
  margin: 5px 0;
  font-size: 13px;
  line-height: 15px;
}
.bim-object .product .product-item .product-item-elem .product-item-list{
  color: #7A7A7A;
  font-size: 11px;
  line-height: 13px;
}

/* custom BIM OBJECT SELECTED - product - properties */
.bim-object .product .product-item .product-item-properties{
  margin-top: 22px;
  border-top: 1px solid lightgray;
}
.bim-object .product .product-item .product-item-properties .product-item-list ul li{
  padding: 6px;
}
.bim-object .product .product-item .product-item-properties .product-item-list ul li:nth-child(even){
  background-color: #f7f7f7;
}

/* custom BIM OBJECT SELECTED - product - classifications */
.bim-object .product .product-item .product-item-classifications .product-item-list li{
  padding: 6px;
}
.bim-object .product .product-item .product-item-classifications .product-item-list li span:first-child{
  font-weight: bold;
}
.bim-object .product .product-item .product-item-classifications .product-item-list li:nth-child(even){
  background-color: #f7f7f7;
}

/* custom BIM OBJECT - empty */
.bim-object .bim-object__empty {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.bim-object .bim-object__empty p {
  margin: 0;
  line-height: 1.5;
  text-align: center;
}

/* style BIMDATA LOADING */
.bimdata-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: rgba(47, 55, 74, 0.9);
  color: #fff;
  z-index: 2;
}
.bimdata-loading--square{
  width: 20px;
  height: 20px;
  position: relative;
  border: 2px #fff solid;
  animation: bimdataloading 1.4s linear infinite;
}
.bimdata-loading--text {
  margin-top: 12px;
  display: block;
}
@keyframes bimdataloading {
  0% {
    box-shadow: inset 0px 0px 0px 0px rgba(#fff, 0.1);
    transform: rotate(-0deg);
  }
  20% {
    transform: rotate(180deg);
  }
  40% {
    transform: rotate(-0deg);
  }
  60% {
    transform: rotate(-0deg);
    box-shadow: inset 0px 0px 0px 0px rgba(#fff, 0.1);
  }
  80% {
    box-shadow: inset 0px -20px 0px 0px rgba(#fff, 1);
  }
  100% {
    box-shadow: inset 0px 0px 0px 0px rgba(#fff, 0.1);
  }
}

</style>
