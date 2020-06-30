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
    <h4 v-if="apiTemp" class="m-x-12">
      {{ JSON.stringify(apiTemp.measurement_name).replace(/\"/g, "") }}
    </h4>
    <div id="chartist-temp" class="chartist ct-chart ct-perfect-fourth m-y-12"></div>

    <h4 v-if="apiPuissance" class="m-x-12">
      {{ JSON.stringify(apiPuissance.measurement_name).replace(/\"/g, "") }}
    </h4>
    <div id="chartist-puissance" class="chartist ct-chart ct-perfect-fourth m-y-12"></div>
  </div>
</template>

<script>
import Chartist from "chartist";
// import ChartistZoom from "chartist-plugin-zoom";
//import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "iot",
  components: {
    //BIMDataButton,
  },
  data() {
    return {
      apiTemp: null,
      apiPuissance: null,
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
  watch: {
    // apiTemp() {
    //   if (this.apiTemp) {
    //     console.log("ay");
    //   } else {
    //     console.log("nope");
    //   }
    // },
  },
  async mounted() {
    this.$watch(
      "apiTemp",
      apiTemp => {
        if (apiTemp) {
          const result = apiTemp.data.reduce(
            (data, dataElement) => {
              data.labels.push(dataElement.timestamp);
              data.series[0].push(dataElement.value);
              return data;
            },
            { labels: [], series: [[]] }
          );
          const options = {
            lineSmooth: false,
            axisX: {
              // type: Chartist.AutoScaleAxis,
              labelInterpolationFnc: function (value) {
                return value.slice(0, 10);
              },
            },
            plugins: [
              // ChartistZoom({
              //resetOnRightMouseBtn: true,
              // onZoom: function (chart, reset) {
              //   storeReset(reset);
              // },
              // }),
            ],
          };
          new Chartist.Line("#chartist-temp", result, options);
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
          const result = apiPuissance.data.reduce(
            (data, dataElement) => {
              data.labels.push(dataElement.timestamp);
              data.series[0].push(dataElement.value);
              return data;
            },
            { labels: [], series: [[]] }
          );
          const options = {
            lineSmooth: false,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value.slice(0, 10);
              },
            },
          };
          new Chartist.Line("#chartist-puissance", result, options);
        }
      },
      {
        immediate: true,
      }
    );
    this.apiTemp = await import("./api/temperature.json");
    this.apiPuissance = await import("./api/puissance.json");
    this.highlightObject();
    this.$hub.on("select-objects", this.fitIfcSelectedOnClick);
  },
  created() {
    this.$emit("set-active");
    this.getSystems();
  },
  methods: {
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
    font-size: 12px;
    line-height: 16px;
    cursor: pointer;
  }
}
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
.ct-series-a{
  .ct-line{
    stroke: $color-success;
  }
}
.annotation-marker{
  &.low{
    background-color: $color-white;
  }
}
</style>
