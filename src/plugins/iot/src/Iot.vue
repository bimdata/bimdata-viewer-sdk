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
          <BIMDataIcon name="success" class="fill-success" />
        </div>
        <div class="system-icon" v-if="selectedElement.name === errorValue">
          <BIMDataIcon name="warning" class="fill-high" />
        </div>
        <span :class="{ error: selectedElement.name === errorValue }">
          {{ selectedElement.name }}
        </span>
        <div class="select-icon">
          <BIMDataIcon name="chevron" class="fill-primary" size="xs" />
        </div>
      </div>
      <transition name="slide-fade-up">
        <ul
          v-show="displayOptions"
          class="bimdata-list"
          v-if="monitoredElements"
        >
          <li
            @click="displayOptions = false"
            v-for="element in monitoredElements"
            :key="element.uuid"
            :class="{ error: element.uuid === errorObjectId }"
          >
            <div v-if="element.uuid !== errorObjectId">
              <BIMDataIcon name="success" class="fill-success" size="xs" />
            </div>
            <div v-if="element.uuid === errorObjectId">
              <BIMDataIcon name="warning" class="fill-high" size="xs" />
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
import {
  BIMDataIcon,
  BIMDataLoading,
} from "@bimdata/design-system/components.js";
export default {
  name: "iot",
  components: {
    Graph,
    BIMDataIcon,
    BIMDataLoading,
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
        this.$viewer.state.selectObjects([newSelectedElement.id], {
          exclusive: true,
        });
        this.loading = true;
        await this.getElementData(newSelectedElement.uuid);
        this.loading = false;
      }
    },
  },
  created() {
    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    this.$viewer.localContext.hub.once("3d-model-loaded", () => {
      console.log('model loaded')
      this.$open();
      this.getMonitoredElements();
    });
    this.$viewer.state.hub.on("objects-selected", ({ objects }) => {
      this.onObjectsSelected(objects.map(obj => obj.uuid));
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
      const url = new URL(this.$viewer.api.apiUrl);
      const hostname = url.hostname;
      let env = "";
      const [apiEnv, ...domainPath] = hostname.split(".");
      const domain = domainPath.join(".");
      if (apiEnv.includes("-staging")) {
        env = "-staging";
      } else if (apiEnv.includes("-next")) {
        env = "-next";
      }
      return url.protocol + "//iot" + env + "." + domain;
    },
    onObjectsSelected(uuids) {
      const selectedAndMonitoredElements = uuids.filter(uuid =>
        this.monitoredElements.some(element => element.uuid === uuid)
      );
      if (selectedAndMonitoredElements.length > 0) {
        this.selectedElement = this.monitoredElements.find(
          element => element.uuid === selectedAndMonitoredElements[0]
        );
      }
    },
    onResetZoomClick() {
      this.resetZoom();
      this.resetZoom = null;
    },
    getSeries(meters) {
      let series = [];
      meters.forEach(meter => {
        const records = meter.measurements.map(({ records }) =>
          records.map(record => ({
            x: Date.parse(record.timestamp),
            y: record.value,
            meta: record.timestamp,
          }))
        );
        series.push({
          meterName: meter.meter_name,
          series: { series: records },
          meterId: meter.meter_id,
        });
      });
      return series;
    },
    async getElementData(elementId) {
      const res = await fetch(
        `${this.getIotUrl()}/element-records/${elementId}?days=7`,
        { headers: this.getHeaders() }
      );
      this.series = this.getSeries(await res.json());
    },
    async getMonitoredElements() {
      const ifcs = this.$viewer.state.ifcs;
      const ifc = ifcs.find(ifc => ifc.name.startsWith("Mirabeau_ELEC")); // When there is more than one ifc
      if (ifc) {
        const apiClient = new this.$viewer.api.apiClient.IfcApi();
        const systems = await apiClient.getSystems(
          this.$viewer.api.cloudId,
          ifc.id,
          this.$viewer.api.projectId
        );
        if (systems.length) {
          const elementUuids = systems[0].elements;
          this.monitoredElements =
            this.$viewer.state.getObjectsByUuids(elementUuids);
          this.selectedElement = this.monitoredElements[0];
          if (this.selectedElement) {
            this.viewer3dPlugin.xeokit.scene.setObjectsColorized(
              [this.selectedElement.uuid],
              [0, 1, 0]
            );
            this.viewer3dPlugin.xeokit.scene.setObjectsColorized(
              ["0vNFceMkb8dezQiQhWAOcS"],
              [1, 0, 0]
            );
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
// For some unknown reasons, rollup doesn't find ../node_modules/chartist/dist/chartist.min.css but only finds ./node_modules/chartist/dist/chartist.min.css (one less dot ate the beginning)
// so ../ works when trying live with webpack, and silently fails when building with rollup.
// A replace is used the rollup.config.js to workaround this bug
@import "../node_modules/chartist/dist/chartist.min.css";
@import "../node_modules/@bimdata/design-system/dist/scss/_BIMDataVariables.scss";
.bimdata-iot {
  overflow: auto;
  height: inherit;
  
  .select {
    position: relative;
    &-content {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      line-height: 16px;
      background-color: var(--color-white);
      box-shadow: var(--box-shadow);
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
        background-color: var(--color-silver-light);
        border-radius: 3px;
      }
    }
    .bimdata-list {
      background-color: var(--color-white);
      box-shadow: var(--box-shadow);
      padding: 6px 12px;
      position: absolute;
      z-index: 1;
      width: 100%;
      left: 0;
      top: calc(44px + 4px);
      li {
        margin: 6px 0;
        display: flex;
        color: var(--color-granite);
        font-size: 12px;
        line-height: 16px;
        position: relative;
        & > div {
          margin-right: 6px;
        }
        &.error {
          color: var(--color-high);
        }
        input {
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
      stroke: var(--color-silver);
      stroke-dasharray: initial;
    }
  }
  .ct-point {
    stroke-width: 4px;
    opacity: 0;
  }
  .ct-zoom-rect {
    fill: rgba(47, 55, 74, 0.3);
    stroke: var(--color-primary);
  }
  .chart-23823,
  .chart-23500 {
    .ct-series-a {
      .ct-line,
      .ct-point {
        stroke: var(--color-success);
      }
    }
  }
  .chart-23501 {
    .ct-series-a {
      .ct-line,
      .ct-point {
        stroke: var(--color-neutral);
      }
    }
    .ct-series-b {
      .ct-line,
      .ct-point {
        stroke: var(--color-warning);
      }
    }
  }
}
.chartist-tooltip {
  display: none;
  &.tooltip-show {
    position: absolute;
    display: block;
    min-width: 5em;
    padding: 5px;
    background: var(--color-secondary);
    color: var(--color-primary);
    font-family: var(--primary-font);
    font-size: 11px;
    text-align: center;
    pointer-events: none;
    z-index: 1;
    &::before {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      width: 0;
      height: 0;
      margin-left: -8px;
      border: 8px solid transparent;
      border-top-color: var(--color-secondary);
    }
    .chartist-tooltip-value {
      display: none;
    }
  }
}
</style>
