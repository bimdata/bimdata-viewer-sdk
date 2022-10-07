<template>
  <div class="iot-equipment-annotation" @click="togglePanel">
    <IotEquipmentIcon color="success" />

    <transition name="fade" mode="out-in">
      <template v-if="isCreation && !submitted">
        <div
          class="iot-equipment-annotation__form"
          @click.stop="() => {}"
        >
          <BIMDataInput
            placeholder="Name"
            v-model="inputName"
          />
          <BIMDataSelect
            label="Device"
            optionKey="uuid"
            optionLabelKey="name"
            :options="AVAILABLE_ELEMENTS" 
            v-model="inputElement"
          />
          <BIMDataButton color="primary" fill radius @click="createIotEquipment">
            Validate
          </BIMDataButton>
        </div>
      </template>
  
      <template v-else>
        <div
          class="iot-equipment-annotation__panel"
          :style="{ visibility: isOpen ? 'visible' : 'hidden' }"
          @click.stop="() => {}"
        >
          <div class="header">
            <IotEquipmentIcon :size="1.6" color="primary" />
            <span class="title">{{ title }}</span>
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
      </template>
    </transition>
  </div>
</template>

<script>
// Components
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataInput,
  BIMDataSelect,
  BIMDataSpinner
} from "@bimdata/design-system/components.js";
import IotEquipmentGraph from "./IotEquipmentGraph.vue";
import IotEquipmentIcon from "./IotEquipmentIcon.vue";

const IOT_BASE_URL = "https://iot-staging.bimdata.io";

const AVAILABLE_ELEMENTS = [
  { uuid: "0vNFceMkb8dezQiQhWAOcQ", name: "Equipment 01" },
  { uuid: "0vNFceMkb8dezQiQhWAOcR", name: "Equipment 02" },
  { uuid: "0vNFceMkb8dezQiQhWAOcS", name: "Equipment 03" },
  { uuid: "0vNFceMkb8dezQiQhWAOcT", name: "Equipment 04" },
  { uuid: "0vNFceMkb8dezQiQhWAOcV", name: "Equipment 05" },
];

export default {
  components: {
    BIMDataButton,
    BIMDataIcon,
    BIMDataInput,
    BIMDataSelect,
    BIMDataSpinner,
    IotEquipmentGraph,
    IotEquipmentIcon
  },
  props: {
    isCreation: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
    },
    y: {
      type: Number,
    },
    name: {
      type: String
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      AVAILABLE_ELEMENTS,
      isOpen: false,
      loading: false,
      title: "",
      series: [],
      inputName: "",
      inputElement: null,
      submitted: false
    };
  },
  mounted() {
    if (!this.isCreation) {
      this.title = this.name;
      this.loadData(this.uuid);
    }
  },
  methods: {
    togglePanel() {
      this.isOpen = !this.isOpen;
    },
    closePanel() {
      this.isOpen = false;
    },
    async loadData(uuid) {
      this.loading = true;
      this.series = await fetch(
        `${IOT_BASE_URL}/element-records/${uuid}/?days=7`,
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
    createIotEquipment() {
      if (this.inputName && this.inputElement) {
        // TODO: save equipment (using BCF API)
        // console.log({
        //   format: "iot-equipment",
        //   title: this.inputName,
        //   description: JSON.stringify({
        //     equipment_uuid: this.inputElement.uuid,
        //     pin: { x: this.x, y: this.y }
        //   })
        // });
        this.$viewer.localContext.getPlugin("IotEquipmentPlugin")
          .saveIotEquipment({
            name: this.inputName,
            uuid: this.inputElement.uuid,
            x: this.x,
            y: this.y
          });
        this.submitted = true;
        this.title = this.inputName;
        this.loadData(this.inputElement.uuid);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.iot-equipment-annotation {
  position: relative;

  &__form,
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
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) * 3);
    padding: var(--spacing-unit);
  }

  &__panel {
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
