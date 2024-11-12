<template>
  <div class="syctom p-12">
    <BIMDataTabs
      :tabs="tabs"
      width="100%"
      height="44px"
      tabSize="33%"
      :selected="selectedTab.id"
      @tab-selected="onTabChange"
      class="syctom__tabs"
    >
      <template #tab="{ tab }">
        <span class="syctom__tabs-label">
          {{ tab.text }}
        </span>
      </template>
    </BIMDataTabs>
    <MaintenanceTab
      v-if="selectedTab.id === 'maintenance'"
      :syctomData="syctomData"
    />
  </div>
</template>

<script>
import { ref } from "vue";

import MaintenanceTab from "./tabs-content/MaintenanceTab.vue";
import syctomData from "./syctom.js";
export default {
  components: {
    MaintenanceTab,
  },
  setup() {
    const tabs = [
      {
        id: "maintenance",
        text: "Maintenance",
      },
      {
        id: "data",
        text: "Données environnementales",
      },
      {
        id: "process",
        text: "Process",
      },
    ];
    const selectedTab = ref(tabs[0]);

    const onTabChange = tab => {
      selectedTab.value = tab;
    };
    return {
      tabs,
      selectedTab,
      onTabChange,
      syctomData,
    };
  },
};
</script>

<style lang="scss" scoped>
.syctom {
  background-color: var(--color-white);
}
</style>

