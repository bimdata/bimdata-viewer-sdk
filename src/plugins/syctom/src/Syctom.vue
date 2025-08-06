<template>
  <div class="syctom p-12">
    <BIMDataTabs
      :tabs="TABS"
      width="100%"
      height="44px"
      tabSize="33%"
      :selected="selectedTab.id"
      @tab-selected="onTabChange"
    >
      <template #tab="{ tab }">
        {{ tab.text }}
      </template>
    </BIMDataTabs>

    <Transition name="fade">
      <MaintenanceTab
        v-if="selectedTab.id === 'maintenance'"
        :data="syctomMaintenanceData"
      />

      <EnvironmentTab
        v-else-if="selectedTab.id === 'environment'"
      />

      <ProcessTab
        v-else-if="selectedTab.id === 'process'"
      />
    </Transition>
  </div>
</template>

<script>
import { onMounted, provide, ref } from "vue";
import SyctomService from "./SyctomService.js";
// import syctomMaintenanceData from "./data/syctom-maintenance-data.json";

import EnvironmentTab from "./environment/EnvironmentTab.vue";
import MaintenanceTab from "./maintenance/MaintenanceTab.vue";
import ProcessTab from "./process/ProcessTab.vue";

const TABS = [
  {
    id: "maintenance",
    text: "Maintenance",
  },
  {
    id: "environment",
    text: "Données environnementales",
  },
  {
    id: "process",
    text: "Process",
  },
];

export default {
  components: {
    EnvironmentTab,
    MaintenanceTab,
    ProcessTab,
  },
  setup() {
    const service = new SyctomService();
    provide("service", service);

    const selectedTab = ref(TABS[0]);

    const onTabChange = tab => {
      selectedTab.value = tab;
    };

    const syctomMaintenanceData = ref([]);

    onMounted(async () => {
      syctomMaintenanceData.value = await service.fetchMaintenanceData();
    });

    return {
      TABS,
      selectedTab,
      syctomMaintenanceData,
      onTabChange,
    };
  },
};
</script>

<style scoped lang="scss">
.syctom {
  height: 100%;
  background-color: var(--color-white);

  .maintenance-tab,
  .environment-tab,
  .process-tab {
    height: calc(100% - 44px);
  }
}
</style>
