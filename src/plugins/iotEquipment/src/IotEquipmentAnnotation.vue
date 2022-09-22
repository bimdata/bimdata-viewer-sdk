<template>
  <div class="iot-equipment-annotation" @click="togglePanel">
    <IotEquipmentIcon color="success" />

    <div
      class="iot-equipment-annotation__panel"
      :style="{ visibility: isOpen ? 'visible' : 'hidden' }"
      @click.stop="() => {}"
    >
      <div class="header">
        <IotEquipmentIcon :size="1.6" color="primary" />
        <span class="title">{{ name }}</span>
        <BIMDataButton color="granite" ghost rounded icon @click="closePanel">
          <BIMDataIcon name="close" size="xxs" />
        </BIMDataButton>
      </div>
      <div class="body">
        <div class="loader" v-show="loading">
          <BIMDataSpinner />
        </div>
        <IotEquipmentGraph
          v-for="serie in series"
          :key="`${uuid}-${serie.id}`"
          :class="`serie-${serie.id}`"
          :title="serie.name"
          :data="serie.data"
        />
      </div>
    </div>
  </div>
</template>

<script>
// Components
import { BIMDataButton, BIMDataIcon, BIMDataSpinner } from "@bimdata/design-system/components.js";
import IotEquipmentGraph from "./IotEquipmentGraph.vue";
import IotEquipmentIcon from "./IotEquipmentIcon.vue";

const IOT_BASE_URL = "https://iot-staging.bimdata.io";

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
    BIMDataSpinner,
    IotEquipmentGraph,
    IotEquipmentIcon
  },
  props: {
    name: {
      type: String,
      required: true
    },
    uuid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isOpen: false,
      loading: false,
      series: [],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    togglePanel() {
      this.isOpen = !this.isOpen;
    },
    closePanel() {
      this.isOpen = false;
    },
    async loadData() {
      this.loading = true;
      this.series = await fetch(
        `${IOT_BASE_URL}/element-records/${this.uuid}/?days=7`,
        {
          headers: {
            Authorization: `Bearer ${this.$viewer.api.accessToken}`,
            "Content-Type": "application/json",
          }
        }
      )
      .then(res => res.json())
      .then(res => res.map(meter => ({
        id: meter.meter_id,
        name: meter.meter_name,
        data: meter.measurements.map(
          ({ records }) => records.map(
            record => ({
              x: Date.parse(record.timestamp),
              y: record.value,
              meta: record.timestamp,
            })
          )
        )
      })));
      this.loading = false;
    },
  }
};
</script>

<style scoped lang="scss">
.iot-equipment-annotation {
  position: relative;

  &__panel {
    position: absolute;
    top: calc(0px - var(--spacing-unit));
    right: calc(0px - var(--spacing-unit) / 2);
    transform: translateX(100%);

    width: 400px;
    padding: calc(var(--spacing-unit) / 2);
    border-radius: 4px;
    box-shadow: var(--box-shadow);
    background-color: var(--color-white);

    .header {
      display: flex;
      align-items: center;
      gap: calc(var(--spacing-unit) / 2);

      .title {
        font-weight: bold;
        margin-right: auto;
      }
    }

    .loader {
      width: 100%;
      height: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
      .bimdata-spinner {
        transform: scale(1.5);
      }
    }
  }
}
</style>
