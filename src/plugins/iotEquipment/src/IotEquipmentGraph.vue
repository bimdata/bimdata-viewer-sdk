<template>
  <div class="iot-equipment-graph">
    <div class="iot-equipment-graph__title">
      {{ title }}
    </div>
    <div
      :id="`chart-${_uid}`"
      class="iot-equipment-graph__chart"
    ></div>
  </div>
</template>

<script>
import Chartist from "chartist";
import ChartistTooltip from "chartist-plugin-tooltips-updated";

function getFormattedDate(timestamp) {
  const date = new Date(timestamp);
  let day = `0${date.getDate()}`.slice(-2);
  let month = `0${date.getMonth() + 1}`.slice(-2);
  return `${day} ${month}`;
}

const chartOptions = {
  lineSmooth: false,
  axisX: {
    type: Chartist.AutoScaleAxis,
    labelInterpolationFnc: getFormattedDate,
  },
  axisY: {
    type: Chartist.AutoScaleAxis,
  },
  plugins: [
    ChartistTooltip(),
  ],
};

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
    };
  },
  mounted() {
    this.$watch(
      "data",
      () => {
        if (this.data) {
          new Chartist.Line(
            `#chart-${this._uid}`,
            { series: this.data },
            chartOptions
          );
        }
      },
      { immediate: true }
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

<style lang="scss">
@import "../node_modules/chartist/dist/chartist.min.css";

.iot-equipment-graph {
  margin: var(--spacing-unit) 0;
  padding: calc(var(--spacing-unit) / 2) 0;
  border-radius: 4px;
  box-shadow: var(--box-shadow);

  &__title {
    margin: 0 var(--spacing-unit) calc(var(--spacing-unit) / 2);
    font-size: 14px;
    font-weight: bold;
  }

  &.serie-23500 /* Capteur COV */,
  &.serie-23823 /* Puissance */ {
    .ct-series-a {
      .ct-line,
      .ct-point {
        stroke: var(--color-success);
      }
    }
  }

  &.serie-23501 /* essai fdx */ {
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
}

.chartist-tooltip {
  display: none;

  &.tooltip-show {
    position: absolute;
    z-index: 1;
    display: block;
    min-width: 5em;
    padding: 5px;
    border-radius: 2px;
    font-family: var(--primary-font);
    font-size: 11px;
    text-align: center;
    background-color: var(--color-secondary);
    color: var(--color-primary);
    pointer-events: none;

    .chartist-tooltip-value {
      display: none;
    }

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
  }
}
</style>
