<template>
  <div class="process-item">
    <div class="title" @click="isOpen = !isOpen">
      <span class="label">{{ item.label }}</span>
      <BIMDataIconChevron size="xs" :rotate="isOpen ? 90 : 0" />
    </div>
    <div class="content" v-if="isOpen">
      <div class="text">
        Analyse de {{ text }}
      </div>
      <div class="graph" ref="graph">
        <!-- TODO -->
      </div>
    </div>
  </div>
</template>

<script>
import 'chartist/dist/index.css';
import { LineChart } from "chartist";
import { computed, inject, ref, watch } from "vue";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const service = inject("service");

    const graph = ref(null);
    const isOpen = ref(false);

    const tags = computed(() => {
      const { tag1 = [], tag2 = [], tag3 = [] } = props.item;
      return tag1.concat(tag2).concat(tag3);
    });

    const text = computed(
      () => `${props.item.label} (${props.item.unit}) (${tags.value.join(", ")})`
    );

    watch(isOpen, async () => {
      if (isOpen.value) {
        const time = (await service.fetchProcessData(["time"]))[0];
        const data = await service.fetchProcessData(tags.value);

        const values = [];
        for (let i = 0; i<time.length; i++) {
          let sum = 0;
          for (let y of data) sum += y[i];
          values.push(sum);
        }
        
        new LineChart(
          graph.value,
          {
            labels: time,
            series: [values],
          },
          {
            height: "300px",
            showPoint: false,
            axisX: {
              // showLabel: false,
              // showGrid: true,

            },
            axisY: {
              // showGrid: true,
            }
          }
        );
      }
    });

    return {
      graph,
      isOpen,
      text,
    };
  },
};
</script>

<style scoped>
.process-item {
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 2);
  border-radius: 3px;
  box-shadow: var(--box-shadow);

  .title {
    padding: var(--spacing-unit) 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    cursor: pointer;
  }

  .content {
    .text {
      margin-bottom: var(--spacing-unit);
    }
  }
}
</style>
