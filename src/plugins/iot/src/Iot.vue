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

    <Graph v-for="data in datas" :key="data.meter_name" :title="data.meter_name" :data="data.series" class="chart-lora" />

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
      datas: [],
      systems: [],
      selectedValue: "Tableau éléctrique:L1000XH800 P300, 0 V/400 V, Triphasé Phase, 3 Fils, Triangle:631658",
      selectedObjectId: "0vNFceMkb8dezQiQhWAOcR",
      displayOptions: false
    };
  },
  computed: {
    headers() {
      return {
        'Authorization': 'Bearer ' + this.$utils.getAccessToken(),
        'Content-Type': 'application/json'
      }
    },
    objectName() {
      const objectNames = this.$utils
        .getAllObjectsOfType("building_element_proxy")
        .map(object => ({ name: object.name, uuid: object.uuid }));
      return objectNames;
    },
    iot_url() {
      const apiUrl = this.$store.state.viewer.viewerComponent.cfg.apiUrl;
      if (apiUrl.includes('staging')) {
        return 'https://iot-staging.bimdata.io';
      } else if (apiUrl.includes('next')) {
        return 'https://iot-next.bimdata.io';
      }
      return process.env.VUE_APP_IOT_API_URL;
      // return 'https://iot.bimdata.io';
    }
  },
  async mounted() {
    await this.getDataObject(this.selectedObjectId);
    this.highlightObject(this.selectedObjectId);
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
    async request(selectedObjectId, meter) {
      const res = await fetch(`${this.iot_url}/element/${selectedObjectId}/meter/${meter.meter_id}/record`, { headers: this.headers });
      const json = await res.json();
      if (json && Object.entries(json.data).length > 0) {
        const data = Object.entries(json.data);
        const series = data.map(([, records]) => records.map(record => ({x: Date.parse(record.timestamp), y: record.value})));
          this.datas.push({ meter_name: meter.meter_name, series: { series } });
      }
    },
    async getDataObject(selectedObjectId) {
      const res = await fetch(`${this.iot_url}/element/${selectedObjectId}/meter`, { headers: this.headers });
      const meters = await res.json();
      this.datas = [];
      let promises = []
      for (const meter of meters) {
        promises.push(this.request(selectedObjectId, meter));
      }
      Promise.all(promises)
    },
    highlightObject(selectedObjectId) {
      if (selectedObjectId && selectedObjectId.length) {
        // this.$hub.emit("isolate-objects", { ids: [selectedObjectId] });
        this.$hub.emit("colorize-objects", {
          ids: [selectedObjectId],
          color: [0, 1, 0],
        });
        this.$hub.emit("create-annotations", {
          ids: [selectedObjectId],
          index: "",
          priority: "low",
        });
        this.$hub.emit("fit-view-objects", { ids: [selectedObjectId] });
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
      this.getDataObject(system.uuid);
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
    fill: rgba(47, 55, 74, 0.3);
    stroke: $color-primary;
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
