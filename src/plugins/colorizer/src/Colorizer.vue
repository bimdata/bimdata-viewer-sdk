<template>
  <div>
    <BIMDataSearch
      placeholder="Search"
      color="primary"
      radius
      v-model="searchText"
      @update:modelValue="refreshClassifications"
      :clear="true"
      @clear="refreshClassifications"
    >
    </BIMDataSearch>
    <BIMDataTable :rows="listClassifications" compensated="true"></BIMDataTable>
  </div>
</template>

<script>
import colormap from "colormap";
import BIMDataTable from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataTable.js";
import BIMDataSearch from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataSearch.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "colorizer",
  components: {
    BIMDataTable,
    BIMDataSearch,
  },
  data() {
    return {
      colormapper: {
        A: "copper",
        B: "winter",
        C: "autumn",
        D: "viridis",
        E: "summer",
        F: "cool",
        G: "chlorophyll",
      },
      classifications: [],
      colorizeIds: [],
      elements: [],
      listClassifications: [],
      searchText: "",
    };
  },
  create() {},
  async onOpen() {
    let elements = {};
    if (this.classifications.length === 0) {
      for (const ifc of this.$viewer.state.ifcs) {
        elements = {
          ...elements,
          ...(await this.$viewer.api.getRawElements(ifc.id)),
        };
      }
      for (const uuid in elements) {
        const classification = elements[uuid].classifications.find(x =>
          x.type.startsWith("Uniformat")
        );
        if (classification) this.storeClassification(classification, uuid);
      }
      [...new Set(this.classifications.map(obj => obj.letter))].forEach(
        letter => {
          const classifications = this.classifications.filter(
            obj => obj.letter === letter
          );
          const colors = colormap({
            colormap: this.colormapper[letter],
            nshades: classifications.lenght,
            format: "hex",
            alpha: 1,
          });
          classifications.forEach(classification => {
            classification.color = colors.pop();
          });
        }
      );
      this.classifications.sort((a, b) => a.notation > b.notation);
      this.refreshClassifications();
    }
    this.classifications.forEach(classi =>
      this.colorObjectsByUuids(classi.uuids, classi.color)
    );
  },

  onClose() {
    this.$viewer.state.colorizeObjects(this.colorizeIds, undefined);
    this.colorizeIds = [];
  },

  methods: {
    colorObjectsByUuids(uuids, color) {
      const ids = this.$viewer.state.getObjectsByUuids(uuids).map(x => x.id);
      this.$viewer.state.colorizeObjects(ids, color);
      this.colorizeIds = this.colorizeIds.concat(ids);
    },
    storeClassification(classification, uuid) {
      const notation = classification.notation;
      let obj = this.classifications.find(elem => elem.notation === notation);
      if (!obj) {
        obj = {
          notation,
          description: classification.description,
          letter: notation[0],
          color: undefined,
          uuids: [],
        };
        this.classifications.push(obj);
      }
      obj.uuids.push(uuid);
    },
    cmpInsensitiveCase(obj) {
      return (
        obj.notation.toLowerCase().includes(this.searchText.toLowerCase()) ||
        obj.description.toLowerCase().includes(this.searchText.toLowerCase())
      );
    },
    refreshClassifications() {
      this.listClassifications = this.classifications
        .filter(this.cmpInsensitiveCase)
        .map(obj => [
          obj.notation,
          obj.description,
          obj.color,
          obj.uuids.length,
        ]);
      this.listClassifications.unshift([
        "notation",
        "description",
        "color",
        "count",
      ]);
    },
  },
};
</script>

<style lang="scss" scoped>
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
</style>
