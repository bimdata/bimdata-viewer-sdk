<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="m-y-24">
    <ul class="bimdata-list" v-if="systems.systems && systems.systems.length">
      <li
        v-for="system in systems.systems[0].children"
        :key="system.uuid"
        @click="getObjectId(system)"
      >
        {{ system.name }}
      </li>
    </ul>
    </div>

    <Graph v-if="dataTemp" :title="apiTemp.meter_name" :data="dataTemp" class="chart-temp"/>

    <Graph v-if="dataPuissance" :title="apiPuissance.meter_name" :data="dataPuissance" class="chart-puissance"/>

    <Graph v-if="dataLora" :title="apiLora.meter_name" :data="dataLora" class="chart-lora"/>

  </div>
</template>

<script>
import Graph from "./Graph.vue";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "iot",
  components: {
    Graph,
  },
  data() {
    return {
      apiTemp: null,
      apiPuissance: null,
      apiLora: null,
      dataTemp: null,
      dataPuissance: null,
      dataLora: null,
      systems: [],
    };
  },
  computed: {
    objectName() {
      const objectNames = this.$utils
        .getAllObjectsOfType("building_element_proxy")
        .map(object => ({ name: object.name, uuid: object.uuid }));
      return objectNames;
    },
  },
  async mounted() {
    this.$watch(
      "apiTemp",
      apiTemp => {
        if (apiTemp) {
          this.dataTemp = apiTemp.data.reduce(
            (data, dataElement) => {
              data.series[0].push({y:dataElement.value, x: Date.parse(dataElement.timestamp)});
              return data;
            },
            { series: [[]] }
          );
        }
      },
      {
        immediate: true,
      }
    );
    this.$watch(
      "apiPuissance",
      apiPuissance => {
        if (apiPuissance) {
          this.dataPuissance = apiPuissance.data.reduce(
            (data, dataElement) => {
              data.series[0].push({y:dataElement.value, x: Date.parse(dataElement.timestamp)});
              return data;
            },
            { series: [[]] }
          );
        }
      },
      {
        immediate: true,
      }
    );
    this.$watch(
      "apiLora",
      apiLora => {
        if (apiLora && Object.entries(apiLora.data).length > 0) {
          const data = Object.entries(apiLora.data);
          const series = data.map(([, records]) => records.map(record => ({x: Date.parse(record.timestamp), y: record.value})));
          this.dataLora = { series };
        }
      },
      {
        immediate: true,
      }
    );
    this.apiTemp = await import("./api/temperature.json");
    this.apiPuissance = await import("./api/puissance.json");
    this.apiLora = await import("./api/lora.json");
    this.highlightObject();
    this.$hub.on("select-objects", this.fitIfcSelectedOnClick);
  },
  created() {
    this.$emit("set-active");
    this.getSystems();
  },
  methods: {
    onResetZoomClick() {
      this.resetZoom();
      this.resetZoom = null;
    },
    highlightObject() {
      const selectedObjectIds = "0vNFceMkb8dezQiQhWAOcR";
      if (selectedObjectIds && selectedObjectIds.length) {
        // this.$hub.emit("isolate-objects", { ids: [selectedObjectIds] });
        this.$hub.emit("colorize-objects", {
          ids: [selectedObjectIds],
          color: [0, 1, 0],
        });
        this.$hub.emit("create-annotations", {
          ids: [selectedObjectIds],
          index: "",
          priority: "low",
        });
        this.$hub.emit("fit-view-objects", { ids: [selectedObjectIds] });
      }
    },
    getObjectId(system) {
      // this.$hub.emit("unisolate-all-objects");
      const selectedAllObjectsIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("deselect-objects", { ids: selectedAllObjectsIds });
      const selectedObjectId = system.uuid;
      this.$hub.emit("select-objects", { ids: [selectedObjectId] });
      this.$hub.emit("fit-view-objects", { ids: [selectedObjectId] });
    },
    fitIfcSelectedOnClick() {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("fit-view-objects", {
        ids: [selectedObjectIds],
      });
    },
    async getSystems() {
      // TODO how to get ifc id... and could it be many of them ???
      const ifcId = 7516;

      const ifc = this.$utils.getSelectedIfcs().find(ifc => ifc.id === ifcId);
      if (ifc && ifc.systems_file) {
        this.systems = await fetch(ifc.systems_file).then(res => res.json());
      }
    }
  },
};
</script>

<style lang="scss">
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
@import "~chartist/dist/chartist.min.css";
@import "~@bimdata/design-system/dist/scss/BIMData.scss";
.bimdata-list{
  li{
    margin: 6px;
    padding: 0 12px;
  .ct-perfect-fourth{
    min-height: 320px;
  }
  .ct-line {
    stroke-width: 2px;
  }
  .ct-labels {
    foreignObject:nth-child(2n) {
      .ct-horizontal {
        display: none;
      }
    }
    .ct-horizontal {
      width: 40px!important;
      margin-top: 10px;
      width: max-content;
      transform: rotate(-45deg);
      transform-origin: left bottom;
      // transform-origin: right;
    }
  }
  .ct-point {
    stroke-width: 1px;
  }
  .ct-zoom-rect {
    fill: rgba(200, 100, 100, 0.3);
    stroke: red;
  }
  .chart-temp, .chart-puissance{
    .ct-series-a{
      .ct-line, .ct-point{
        stroke: $color-success;
      }
    }
  }
  .chart-lora{
    .ct-series-a{
      .ct-line, .ct-point{
        stroke: $color-neutral;
      }
    }
    .ct-series-b{
      .ct-line, .ct-point{
        stroke: $color-warning;
      }
    }
  }
  .annotation-marker{
    &.low{
      background-color: $color-white;
    }
  }
</style>