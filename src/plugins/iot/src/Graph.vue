<template>
  <div>
    <h4 class="m-x-12">
      {{ title }}
    </h4>
    <div
      :id="index"
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
// TODO : change chart lib
import Chartist from "chartist";
import ChartistZoom from "chartist-plugin-zoom";
import ChartistTooltip from "chartist-plugin-tooltips-updated";

let chartistIndex = 1;

export default {
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
  data() {
    return {
      resetZoom: null,
      options: {
        lineSmooth: false,
        axisX: {
          type: Chartist.AutoScaleAxis,
          labelInterpolationFnc: this.getFormatedDate,
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
      index: `chartist-${chartistIndex++}`,
    };
  },
  mounted() {
    this.$watch(
      "data",
      () => {
        if (this.data) {
          new Chartist.Line("#" + this.index, this.data, this.options);
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
    getFormatedDate(timestamp) {
      const date = new Date(timestamp);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      const formatDate = `${day} ${month}`;
      return formatDate;
    },
  },
};
</script>

<style lang="scss" scoped>
.bimdata-btn {
  margin-left: auto;
  margin-right: 12px;
}
</style>
