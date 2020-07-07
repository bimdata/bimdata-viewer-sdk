<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="bimdata-iot m-y-12 p-x-12">
    <div class="select">
      <div @click="displayOptions = !displayOptions" class="select-content" :class="{ active: displayOptions }">
        <div class="system-icon">
          <BIMDataIcon
            class="icon-system"
            icon-name="iconSystem"
            width="13"
            height="15"
            x="23"
            y="23"
          >
            <BIMDataSystemIcon />
          </BIMDataIcon>
        </div>
        <span>
          {{ selectedValue }}
        </span>
        <div class="select-icon">
          <BIMDataIcon
            class="icon-chevron"
            icon-name="iconName"
            width="12"
            height="10"
            x="23"
            y="23"
          >
            <BIMDataChevronIcon />
          </BIMDataIcon>
        </div>
      </div>
      <transition name="slide-fade-up">
        <ul v-show="displayOptions" class="bimdata-list" v-if="systems.systems && systems.systems.length">
          <li
            v-for="system in systems.systems[0].children"
            :key="system.uuid"
            @click="getObjectId(system)"
          >
            {{ system.name }}
          </li>
        </ul>
      </transition>
    </div>

    <Graph v-if="dataTemp" :title="apiTemp.meter_name" :data="dataTemp" class="chart-temp"/>

    <Graph v-if="dataPuissance" :title="apiPuissance.meter_name" :data="dataPuissance" class="chart-puissance"/>

    <Graph v-if="dataLora" :title="apiLora.meter_name" :data="dataLora" class="chart-lora"/>

  </div>
</template>

<script>
import Graph from "./Graph.vue";
import BIMDataSystemIcon from "./BIMDataSystemIcon.vue";

import {BIMDataIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'
import {BIMDataChevronIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'

export default {
  // https://vuejs.org/v2/guide/components.html
  name: "iot",
  components: {
    Graph,
    BIMDataSystemIcon,
    BIMDataIcon,
    BIMDataChevronIcon
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
      selectedValue: "Tableau éléctrique:L1000XH800 P300, 0 V/400 V, Triphasé Phase, 3 Fils, Triangle:631658",
      displayOptions: false
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
      this.displayOptions = !this.displayOptions;
      this.selectedValue = system.name;
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
//@import "~@bimdata/design-system/dist/css/design-system.css";
@import "~@bimdata/design-system/dist/scss/BIMData.scss";

.bimdata-iot{
  .select{
    position: relative;
    &-content{
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      line-height: 16px;
      background-color: white;
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
      padding: 6px 12px;
      border-radius: 3px;
      cursor: pointer;
      &.active{
        .select-icon{
          svg{
            transform: rotate(90deg);
          }
        }
      }
      & > .system-icon{
        margin-right: 12px;
      }
      & > span{
        width: calc(100% - 21px - 13px - 12px);
      }
      & > .select-icon{
        width: 21px;
        height: 21px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $color-tertiary-lightest;
        border-radius: 3px;
      }
    }
    .bimdata-list{
      background-color: white;
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
      padding: 6px 12px;
      position: absolute;
      z-index: 1;
      width: 100%;
      left: 0;
      top: calc(44px + 4px);
    }
  }
  .bimdata-list{
    li{
      margin: 6px 0;
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
}
</style>
