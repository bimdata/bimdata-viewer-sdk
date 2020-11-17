<template>
  <div class="bimdata-iot m-y-12 p-x-12">
    <div class="select">
      <div
        @click="displayOptions = !displayOptions"
        class="select-content"
        :class="{ active: displayOptions }"
        v-if="selectedElement"
      >
        <div class="system-icon" v-if="selectedElement.name !== errorValue">
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
        <div class="system-icon" v-if="selectedElement.name === errorValue">
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
        <span :class="{ error: selectedElement.name === errorValue }">
          {{ selectedElement.name }}
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
        <ul v-show="displayOptions" class="bimdata-list" v-if="monitoredElements">
          <li
            @click="displayOptions = false"
            v-for="element in monitoredElements"
            :key="element.uuid"
            :class="{ error: element.uuid === errorObjectId }"
          >
            <div v-if="element.uuid !== errorObjectId">
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
            <div v-if="element.uuid === errorObjectId">
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
              v-model="selectedElement"
              :name="`element-iot-${_uid}`"
              :id="element.uuid"
              :value="element"
            />
            <label>{{ element.name }}</label>
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
      monitoredElements: [],
      selectedElement: null,
      errorValue: "Tableau éléctrique:L1000XH800 P300:631661",
      errorObjectId: "0vNFceMkb8dezQiQhWAOcS",
      displayOptions: false,
      loading: false,
      viewer3dPlugin: null,
    };
  },
  watch: {
    async selectedElement(newSelectedElement) {
      if (newSelectedElement) {
        this.viewer3dPlugin.fitViewObjects([newSelectedElement.uuid]);
        this.$viewer.state.selectObjects([newSelectedElement.id], { exclusive: true });
        this.loading = true;
        await this.getElementData(newSelectedElement.uuid);
        this.loading = false;
      }
    },
  },
  created() {
    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    this.$viewer.localContext.hub.once("3d-model-loaded", () => {
      this.$open();
      this.getMonitoredElements();
    });
    this.$viewer.state.hub.on("objects-selected", ({ objects }) => {
      this.onObjectsSelected(objects.map(obj => obj.uuid))
    });
  },
  methods: {
    getHeaders() {
      return {
        Authorization: "Bearer " + this.$viewer.api.accessToken,
        "Content-Type": "application/json",
      };
    },
    getIotUrl() {
      const apiUrl = this.$viewer.api.apiUrl;
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
    },
    onObjectsSelected(uuids) {
      const selectedAndMonitoredElements = uuids.filter(uuid => this.monitoredElements.some(element => element.uuid === uuid));
      if (selectedAndMonitoredElements.length > 0) {
        this.selectedElement = this.monitoredElements.find(element => element.uuid === selectedAndMonitoredElements[0]);
      }
    },
    onResetZoomClick() {
      this.resetZoom();
      this.resetZoom = null;
    },
    async getMeterData(elementId, meter) {
      const res = await fetch(
        `${this.getIotUrl()}/element/${elementId}/meter/${meter.meter_id}/record`,
        { headers: this.getHeaders() }
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
    async getElementData(elementId) {
      this.series = [];
      const res = await fetch(`${this.getIotUrl()}/element/${elementId}/meter`, { headers: this.getHeaders() });
      const meters = await res.json();
      const promises = meters.map(meter => this.getMeterData(elementId, meter));
      const series = await Promise.all(promises);
      this.series = series.filter(Boolean);
    },
    async getMonitoredElements() {
      const ifcs = this.$viewer.state.ifcs;
      const ifc = ifcs.find(ifc => ifc.name == "Mirabeau_ELEC.ifc"); // When there is more than one ifc
      if (ifc) {
        const apiClient = new this.$viewer.api.apiClient.IfcApi();
        const systems = await apiClient.getSystems(
          this.$viewer.api.cloudId,
          ifc.id,
          this.$viewer.api.projectId,
        );
        if (systems.length) {
          const elementUuids = systems[0].elements;
          this.monitoredElements = this.$viewer.state.getObjectsByUuids(elementUuids);
          this.selectedElement = this.monitoredElements[0];
          if(this.selectedElement) {
            this.viewer3dPlugin.xeokit.scene.setObjectsColorized([this.selectedElement.uuid], [0, 1, 0]);
            this.viewer3dPlugin.xeokit.scene.setObjectsColorized(["0vNFceMkb8dezQiQhWAOcS"], [1, 0, 0]);
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import "./node_modules/chartist/dist/chartist.min.css";
@import "./node_modules/@bimdata/design-system/dist/scss/BIMData.scss";

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
      background-color: $color-white;
      box-shadow: 0px 2px 10px rgba($color-black, 0.1);
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
      background-color: $color-white;
      box-shadow: 0px 2px 10px rgba($color-black, 0.1);
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
    stroke-width: 4px;
    opacity: 0;
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
.chartist-tooltip{
  display: none;
  &.tooltip-show{
    position: absolute;
    display: block;
    min-width: 5em;
    padding: 5px;
    background: $color-secondary;
    color: $color-primary;
    font-family: $primary-font;
    font-size: 11px;
    text-align: center;
    pointer-events: none;
    z-index: 1;
    &::before{
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      width: 0;
      height: 0;
      margin-left: -8px;
      border: 8px solid transparent;
      border-top-color: $color-secondary;
    }
    .chartist-tooltip-value{
      display: none;
    }
  }
}

</style>
