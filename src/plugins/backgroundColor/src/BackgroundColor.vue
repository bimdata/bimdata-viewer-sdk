<template>
  <div></div>
</template>
<script>
import pickerModal from "./pickerModal.vue";

export default {
  name: "backgroundColor",
  created() {
    const rightClickMenu = this.$plugins.rightClickMenu;

    rightClickMenu.registerCommand({
      label: "title",
      execute: () => this.$plugins.modalManager.pushModal(pickerModal),
      predicate: () => true,
    });
  },
};
</script>
