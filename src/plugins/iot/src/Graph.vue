<template>
  <div>
    <h4 class="m-x-12">
      {{ title }}
    </h4>
    <div
      :id="`chartist-${_uid}`"
      class="chartist ct-chart ct-perfect-fourth m-y-12"
    ></div>
    <BIMDataButton
      class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      @click="onResetZoomClick"
      :disabled="!resetZoom"
      width="100px"
      height="28px"
      >reset zoom</BIMDataButton
    >
  </div>
</template>

<script>
import Chartist from "chartist";
import ChartistZoom from "chartist-plugin-zoom";
import ChartistTooltip from "chartist-plugin-tooltips-updated";
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton.js";

export default {
  data() {
    return {
      resetZoom: null,
      options: {
        lineSmooth: false,
        axisX: {
          type: Chartist.AutoScaleAxis,
          labelInterpolationFnc: function(value) {
            return new Date(value).toISOString().slice(0, 10);
          },
        },
        axisY: {
          type: Chartist.AutoScaleAxis,
        },
        plugins: [
          ChartistTooltip(),
          ChartistZoom({
            resetOnRightMouseBtn: false,
            onZoom: (chart, reset) => {
              this.resetZoom = reset;
            },
          }),
        ],
      },
    };
  },
  components: {
    BIMDataButton
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.$watch(
      "data",
      () => {
        if (this.data) {
          new Chartist.Line(`#chartist-${this._uid}`, this.data, this.options);
        }
      },
      {
        immediate: true,
      }
    );
  },
  methods: {
    onResetZoomClick() {
      this.resetZoom();
      this.resetZoom = null;
    },
  },
};
</script>

<style lang="scss" scoped>
//@import "~@bimdata/design-system/dist/scss/BIMData.scss";
.bimdata-btn{
  margin-left: auto;
  margin-right: 12px;
}
</style>