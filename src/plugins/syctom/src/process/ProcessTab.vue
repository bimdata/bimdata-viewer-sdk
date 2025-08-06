<template>
  <div class="process-tab">
    <ProcessGroup
      v-for="group in GROUPS"
      :key="group.label"
      :group="group"
    />
  </div>
</template>

<script>
import { GROUPS } from "../../data/syctom-process-config.js";

import ProcessGroup from "./ProcessGroup.vue";

export default {
  components: {
    ProcessGroup,
  },
  setup() {
    return { GROUPS };
  }
};
</script>

<style scoped>
.process-tab {
  padding: calc(var(--spacing-unit) * 2) 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}
</style>
