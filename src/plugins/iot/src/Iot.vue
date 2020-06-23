<template>
  <!-- https://vuejs.org/v2/guide/syntax.html -->
  <div class="m-y-6">
    {{ system }}
    <ul>
      <li
        v-for="object in objectName"
        :key="object.uuid"
        @click="getObjectId(object)"
      >
        {{ object.name }}
      </li>
    </ul>
    <h4 v-if="api" class="m-x-12">
      {{ JSON.stringify(api.measurement_name).replace(/\"/g, "") }}
    </h4>

    <div id="my-chart" class="chartist ct-chart ct-perfect-fourth m-y-12"></div>

    <!-- <BIMDataButton
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      @click="highlightObject"
    >
      highlight
    </BIMDataButton>
    <BIMDataButton
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      @click="unisolate"
    >
      unisolate
    </BIMDataButton> -->

    <!-- {{ JSON.stringify(api) }} -->
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
      api: null,
      system: [],
    };
  },
  computed: {
    objectName() {
      const objectNames = this.$utils
        .getAllObjectsOfType("building_element_proxy")
        .map(object => ({ name: object.name, uuid: object.uuid }));
      console.log(objectNames);
      return objectNames;
    },
  },
  watch: {
    // api() {
    //   if (this.api) {
    //     console.log("ay");
    //   } else {
    //     console.log("nope");
    //   }
    // },
  },
  async mounted() {
    this.$watch(
      "api",
      api => {
        if (api) {
          const result = api.data.reduce(
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
          new Chartist.Line(".ct-chart", result, options);
        }
      },
      {
        immediate: true,
      }
    );
    this.api = await import("./api/temperature.json");
    this.highlightObject();
    this.$hub.on("select-objects", this.fitIfcSelectedOnClick);
  },
  created() {
    this.$emit("set-active");
    this.getSystems();
  },
  methods: {
    highlightObject() {
      const selectedObjectIds = this.api.meter_id;
      if (selectedObjectIds && selectedObjectIds.length) {
        this.$hub.emit("isolate-objects", { ids: [selectedObjectIds] });
        this.$hub.emit("colorize-objects", {
          ids: [selectedObjectIds],
          color: [1, 0, 0],
        });
        this.$hub.emit("fit-view-objects", { ids: [selectedObjectIds] });
      }
    },
    getObjectId(object) {
      this.$hub.emit("unisolate-all-objects");
      const selectedAllObjectsIds = this.$utils.getSelectedObjectIds();
      this.$hub.emit("deselect-objects", { ids: selectedAllObjectsIds });
      const selectedObjectId = object.uuid;
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
      this.system = await new this.$bimdataApiClient.IfcApi().getSystems(
        this.$utils.getCloudId(),
        7516,
        this.$utils.getProjectId()
      );
      return this.system;
    },
  },
};
</script>

<style lang="scss">
/* https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles */
@import "~chartist/dist/chartist.min.css";
@import "~@bimdata/design-system/dist/scss/BIMData.scss";
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
    width: max-content;
    transform: rotate(-45deg);
    transform-origin: right;
  }
}
.ct-point {
  stroke-width: 1px;
}
</style>
