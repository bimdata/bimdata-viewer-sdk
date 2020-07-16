<template>
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
            :class="{ error : system.uuid === errorObjectId }"
          >
            <div v-if="system.uuid !== errorObjectId">
              <BIMDataIcon
                class="icon-chevron"
                icon-name="successIcon"
                width="12"
                height="11"
                x="23"
                y="23"
              >
                <BIMDataSuccessIcon />
              </BIMDataIcon>
            </div>
            <div v-if="system.uuid === errorObjectId">
              <BIMDataIcon
                class="icon-chevron"
                icon-name="warningIcon"
                width="12"
                height="11"
                x="23"
                y="23"
              >
                <BIMDataWarningIcon />
              </BIMDataIcon>
            </div>
            {{ system.name }}
          </li>
        </ul>
      </transition>
    </div>

    <Graph v-for="serie in series" :key="serie.meter_name" :title="serie.meter_name" :data="serie.series" :class="`chart-${serie.meter_id}`" />
    <BIMDataLoading v-if="series.length === 0"></BIMDataLoading>

  </div>
</template>

<script>
import Graph from "./Graph.vue";
import BIMDataSystemIcon from "./BIMDataSystemIcon.vue";

import {BIMDataIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'
import {BIMDataChevronIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'
import {BIMDataSuccessIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'
import {BIMDataWarningIcon} from '@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js'


import BIMDataLoading from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataLoading.js";

export default {
  name: "iot",
  components: {
    Graph,
    BIMDataSystemIcon,
    BIMDataIcon,
    BIMDataChevronIcon,
    BIMDataLoading,
    BIMDataSuccessIcon,
    BIMDataWarningIcon
  },
  data() {
    return {
      series: [],
      systems: [],
      selectedValue: "Tableau éléctrique:L1000XH800 P300, 0 V/400 V, Triphasé Phase, 3 Fils, Triangle:631658",
      selectedObjectId: "0vNFceMkb8dezQiQhWAOcR",
      errorObjectId : "0vNFceMkb8dezQiQhWAOcS",
      displayOptions: false,
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

      if (process.env.VUE_APP_IOT_API_URL) {
        return process.env.VUE_APP_IOT_API_URL;
      } else if (apiUrl.includes('staging')) {
        return 'https://iot-staging.bimdata.io';
      } else if (apiUrl.includes('next')) {
        return 'https://iot-next.bimdata.io';
      } else if (apiUrl === "https://api.bimdata.io") {
        return 'https://iot.bimdata.io';
      }
    }
  },
  async mounted() {
    await this.getDataObject(this.selectedObjectId);
    this.greenObject(this.selectedObjectId);
    this.redObject();
    this.$hub.on("select-objects", this.fitIfcSelectedOnClick);
  },
  created() {
    this.$emit("set-active");
    this.getSystems();
  },
  methods: {
    async getRecords(selectedObjectId, meter) {
      const res = await fetch(`${this.iot_url}/element/${selectedObjectId}/meter/${meter.meter_id}/record`, { headers: this.headers });
      const json = await res.json();
      if (json && Object.entries(json.data).length > 0) {
        const data = Object.entries(json.data);
        const series = data.map(([, records]) => records.map(record => ({x: Date.parse(record.timestamp), y: record.value})));
        return { meter_name: meter.meter_name, meter_id: meter.meter_id, series: { series } };
      }
    },
    async getDataObject(selectedObjectId) {
      const res = await fetch(`${this.iot_url}/element/${selectedObjectId}/meter`, { headers: this.headers });
      const meters = await res.json();
      const promises = meters.map(meter => this.getRecords(selectedObjectId, meter));
      const series = await Promise.all(promises);
      this.series = series.filter(serie => !!serie)
    },
    greenObject(selectedObjectId) {
      if (selectedObjectId && selectedObjectId.length) {
        this.$hub.emit("colorize-objects", {
          ids: [selectedObjectId],
          color: [0, 1, 0],
        });
        this.$hub.emit("fit-view-objects", { ids: [selectedObjectId] });
      }
    },
    redObject() {
      this.$hub.emit("colorize-objects", {
        ids: ["0vNFceMkb8dezQiQhWAOcS"],
        color: [1, 0, 0],
      });
    },
    getObjectId(system) {
      const selectedAllObjectsIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("deselect-objects", { ids: selectedAllObjectsIds });
      const selectedObjectId = system.uuid;
      this.$hub.emit("select-objects", { ids: [selectedObjectId] });
      this.$hub.emit("fit-view-objects", { ids: [selectedObjectId] });
      this.displayOptions = !this.displayOptions;
      this.selectedValue = system.name;
      this.getDataObject(system.uuid);
    },
    fitIfcSelectedOnClick(system) {
      const selectedObjectIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("fit-view-objects", {
        ids: [selectedObjectIds],
      });
      this.getDataObject(system.uuid);
    },
    async getSystems() {
      const ifc = this.$utils.getSelectedIfcs()[0];
      if (ifc && ifc.systems_file) {
        const ifcApi = new this.$bimdataApiClient.IfcApi();

        this.systems = await ifcApi.getSystems(
          this.$utils.getCloudId(),
          ifc.id,
          this.$utils.getProjectId()
        )
      }
    }
  },
};
</script>

<style lang="scss">
@import "node_modules/chartist/dist/chartist.min.css";
@import "node_modules/@bimdata/design-system/dist/scss/BIMData.scss";

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
      li{
        margin: 6px 0;
        display: flex;
        color: $color-tertiary-darkest;
        font-size: 12px;
        line-height: 16px;
        cursor: pointer;
        & > div {
          margin-right: 6px;
          svg{
            fill: $color-success;
          }
        }
        &.error{
          color: $color-high;
          & > div {
            svg{
              fill: $color-high;
            }
          }
        }
      }
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
      width: 34px!important;
      margin-top: 10px;
      width: max-content;
      transform: rotate(-45deg);
      transform-origin: left bottom;
    }
  }
  .ct-grids{
    .ct-horizontal{
      display: none;
      &:first-child{
        display: block;
        stroke-width: 2px;
        stroke-dasharray: initial;
      }
    }
    .ct-vertical{
      stroke: $color-tertiary;
      stroke-dasharray: initial;
      &:first-child{
        stroke-width: 2px;
      }
    }
  }
  .ct-point {
    stroke-width: 1px;
  }
  .ct-zoom-rect {
    fill: rgba(47, 55, 74, 0.3);
    stroke: $color-primary;
  }
  .chart-23823, .chart-23500{
    .ct-series-a{
      .ct-line, .ct-point{
        stroke: $color-success;
      }
    }
  }
  .chart-23501{
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
}
</style>