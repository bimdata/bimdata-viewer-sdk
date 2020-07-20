<template>
  <div class="bimdata-iot m-y-12 p-x-12">
    <div class="select">
      <div
        @click="displayOptions = !displayOptions"
        class="select-content"
        :class="{ active: displayOptions }"
      >
        <div class="system-icon" v-if="selectedSystem.name !== errorValue">
          <BIMDataIcon
            class="icon-success color-success"
            icon-name="successIcon"
            width="14"
            height="14"
            x="23"
            y="23"
          >
            <BIMDataSuccessIcon />
          </BIMDataIcon>
        </div>
        <div class="system-icon" v-if="selectedSystem.name === errorValue">
          <BIMDataIcon
            class="icon-warning color-high"
            icon-name="warningIcon"
            width="14"
            height="14"
            x="23"
            y="23"
          >
            <BIMDataWarningIcon />
          </BIMDataIcon>
        </div>
        <span :class="{ error: selectedSystem.name === errorValue }">
          {{ selectedSystem && selectedSystem.name }}
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
        <ul v-show="displayOptions" class="bimdata-list" v-if="systems">
          <li
            @click="displayOptions = false"
            v-for="system in systems"
            :key="system.uuid"
            :class="{ error: system.uuid === errorObjectId }"
          >
            <div v-if="system.uuid !== errorObjectId">
              <BIMDataIcon
                class="icon-chevron color-success"
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
                class="icon-chevron color-high"
                icon-name="warningIcon"
                width="12"
                height="11"
                x="23"
                y="23"
              >
                <BIMDataWarningIcon />
              </BIMDataIcon>
            </div>

            <input
              type="radio"
              v-model="selectedSystem"
              :name="`system-iot-${_uid}`"
              :id="system.uuid"
              :value="system"
            />
            <label>{{ system.name }}</label>
          </li>
        </ul>
      </transition>
    </div>

    <Graph
      v-for="serie in series"
      :key="serie.meterName"
      :title="serie.meterName"
      :data="serie.series"
      class="m-y-12"
      :class="`chart-${serie.meterId}`"
    />

    <BIMDataLoading v-if="loading"></BIMDataLoading>
  </div>
</template>

<script>
import Graph from "./Graph.vue";

import { BIMDataIcon } from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js";
import { BIMDataChevronIcon } from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js";
import { BIMDataSuccessIcon } from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js";
import { BIMDataWarningIcon } from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataIcons.js";

import BIMDataLoading from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataLoading.js";

import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers(
  "viewer"
);

export default {
  name: "iot",
  components: {
    Graph,
    BIMDataIcon,
    BIMDataChevronIcon,
    BIMDataLoading,
    BIMDataSuccessIcon,
    BIMDataWarningIcon,
  },
  data() {
    return {
      series: [],
      systems: [],
      selectedSystem: null,
      errorValue: "Tableau éléctrique:L1000XH800 P300:631661",
      errorObjectId: "0vNFceMkb8dezQiQhWAOcS",
      displayOptions: false,
      loading: false,
    };
  },
  computed: {
    selectedSystemId() {
      return this.selectedSystem && this.selectedSystem.uuid;
    },
    headers() {
      return {
        Authorization: "Bearer " + this.$utils.getAccessToken(),
        "Content-Type": "application/json",
      };
    },
    iotUrl() {
      const apiUrl = this.$utils.getApiUrl();
      if (process.env.VUE_APP_IOT_API_URL) {
        return process.env.VUE_APP_IOT_API_URL;
      } else if (apiUrl.includes('staging')) {
        return 'https://iot-staging.bimdata.io';
      } else if (apiUrl.includes('next')) {
        return 'https://iot-next.bimdata.io';
      } else if (apiUrl === "https://api.bimdata.io") {
        return 'https://iot.bimdata.io';
      }
      return null;
      // return 'https://iot.bimdata.io';
    },
    ...mapState({
      selectedIfcs: state => state.selectedIfcs
    }),
  },
  watch: {
    async selectedSystem(newSelectedSystem) {
      if (newSelectedSystem) {
        this.$hub.emit("fit-view-objects", { ids: [newSelectedSystem.uuid] });
        this.$hub.emit("deselect-objects", { ids: this.$utils.getSelectedObjectIds()});
        this.$hub.emit("select-objects", { ids: [newSelectedSystem.uuid]});
        this.loading = true;
        await this.getSystemData(newSelectedSystem.uuid);
        this.loading = false;
      }
    },
    selectedIfcs() { // TODO POC only
      if (this.systems.length === 0) {
        this.getSystems();
      }
    }
  },
  created() {
    this.$emit("set-active");
    this.getSystems();
    this.$hub.on("select-objects", this.onObjectsSelected);
  },
  methods: {
    onObjectsSelected({ids}) {
      const selectedSystemsIds = Array.from(ids).filter(id => this.systems.some(system => system.uuid === id));
      if (selectedSystemsIds.length > 0) {
        this.selectedSystem = this.systems.find(system => system.uuid === selectedSystemsIds[0]);
      }
    },
    onResetZoomClick() {
      this.resetZoom();
      this.resetZoom = null;
    },
    async getMeterData(systemId, meter) {
      const res = await fetch(
        `${this.iotUrl}/element/${systemId}/meter/${meter.meter_id}/record`,
        { headers: this.headers }
      );
      const json = await res.json();
      if (json && Object.entries(json.data).length > 0) {
        const data = Object.entries(json.data);
        const series = data.map(([, records]) =>
          records.map(record => ({
            x: Date.parse(record.timestamp),
            y: record.value,
            meta: record.timestamp,
          }))
        );
        return {
          meterName: meter.meter_name,
          series: { series },
          meterId: meter.meter_id,
        };
      }
    },
    async getSystemData(systemId) {
      this.series = [];
      const res = await fetch(`${this.iotUrl}/element/${systemId}/meter`, { headers: this.headers });
      const meters = await res.json();
      const promises = meters.map(meter => this.getMeterData(systemId, meter));
      const series = await Promise.all(promises);
      this.series = series.filter(Boolean);
    },
    async getSystems() {
      const ifc = this.$utils.getSelectedIfcs()[0];
      if (ifc && ifc.systems_file) {
        const systemsRes = await fetch(ifc.systems_file).then((res) => res.json());
        this.systems = systemsRes && systemsRes.systems && systemsRes.systems[0].children;
        // const ifcApi = new this.$bimdataApiClient.IfcApi();
        // this.systems = await ifcApi.getSystems(
        //   this.$utils.getCloudId(),
        //   ifc.id,
        //   this.$utils.getProjectId()
        // );
        if (this.systems && this.systems.length) {
          this.selectedSystem = this.systems[0];
          this.$hub.emit("colorize-objects", {
            ids: [this.selectedSystem.uuid],
            color: [0, 1, 0],
          });
          this.$hub.emit("colorize-objects", {
            ids: ["0vNFceMkb8dezQiQhWAOcS"],
            color: [1, 0, 0],
          });
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import "node_modules/chartist/dist/chartist.min.css";
@import "node_modules/@bimdata/design-system/dist/scss/BIMData.scss";

.bimdata-iot {
  .select {
    position: relative;
    &-content {
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
      &.active {
        .select-icon {
          svg {
            transform: rotate(90deg);
          }
        }
      }
      & > .system-icon {
        margin-right: 6px;
      }
      & > span {
        width: calc(100% - 21px - 13px - 12px);
      }
      & > .select-icon {
        width: 21px;
        height: 21px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $color-tertiary-lightest;
        border-radius: 3px;
      }
    }
    .bimdata-list {
      background-color: white;
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
      padding: 6px 12px;
      position: absolute;
      z-index: 1;
      width: 100%;
      left: 0;
      top: calc(44px + 4px);
      li {
        margin: 6px 0;
        display: flex;
        color: $color-tertiary-darkest;
        font-size: 12px;
        line-height: 16px;
        position: relative;
        & > div {
          margin-right: 6px;
        }
        &.error {
          color: $color-high;
        }
        input{
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          margin: 0;
          cursor: pointer;
        }
      }
    }
  }
  .ct-perfect-fourth {
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
      width: 32px !important;
      margin-top: 10px;
      width: max-content;
      transform: rotate(-45deg);
      transform-origin: left bottom;
      word-break: break-word;
    }
  }
  .ct-grids {
    .ct-horizontal {
      display: none;
      &:first-child {
        display: block;
        stroke-width: 2px;
        stroke-dasharray: initial;
      }
    }
    .ct-vertical {
      stroke: $color-tertiary;
      stroke-dasharray: initial;
    }
  }
  .ct-point {
    stroke-width: 1px;
  }
  .ct-zoom-rect {
    fill: rgba(47, 55, 74, 0.3);
    stroke: $color-primary;
  }
  .chart-23823,
  .chart-23500 {
    .ct-series-a {
      .ct-line,
      .ct-point {
        stroke: $color-success;
      }
    }
  }
  .chart-23501 {
    .ct-series-a {
      .ct-line,
      .ct-point {
        stroke: $color-neutral;
      }
    }
    .ct-series-b {
      .ct-line,
      .ct-point {
        stroke: $color-warning;
      }
    }
  }
}
</style>
